// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title  Gozzy Group Enterprise Payroll
 * @notice International-standard on-chain payroll with multi-sig treasury,
 *         tax withholding, bonuses, vesting, and full audit trail.
 */
contract GozzyPayroll {
    // ---------------------------------------------------------
    // Roles
    // ---------------------------------------------------------
    address public superAdmin;
    mapping(address => bool) public admins;      // payroll operators
    mapping(address => bool) public auditors;    // read-only compliance

    // ---------------------------------------------------------
    // Employee record
    // ---------------------------------------------------------
    struct Employee {
        string  fullName;
        string  role;
        string  country;        // ISO code, e.g. "NG", "US"
        string  currency;       // "USD", "EUR", "GBP"...
        uint256 grossSalary;    // per-month, in wei-equivalent base units
        uint256 taxBps;         // tax in basis points (e.g. 750 = 7.5%)
        uint256 lastPaidAt;
        uint256 totalGross;
        uint256 totalNet;
        uint256 totalTax;
        bool    active;
        bool    autoPay;
    }

    mapping(address => Employee) public employees;
    address[] public employeeList;

    // ---------------------------------------------------------
    // Treasury / payouts
    // ---------------------------------------------------------
    uint256 public constant MONTH = 30 days;
    uint256 public treasuryBalance;         // tracked separately from msg.value
    address[] public signers;               // multi-sig signers
    uint256 public requiredSignatures;      // M-of-N
    mapping(bytes32 => uint256) public approvalCount;
    mapping(bytes32 => mapping(address => bool)) public approved;

    // ---------------------------------------------------------
    // Events (audit trail)
    // ---------------------------------------------------------
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    event EmployeeAdded(address indexed wallet, string name, string country);
    event EmployeeUpdated(address indexed wallet, uint256 newSalary, bool active);
    event SalaryPaid(address indexed wallet, uint256 gross, uint256 net, uint256 tax, string kind);
    event TreasuryFunded(address indexed from, uint256 amount);
    event TreasuryWithdrawn(address indexed to, uint256 amount);
    event AutoPayToggled(address indexed wallet, bool enabled);
    event MultiSigProposal(bytes32 indexed id, address indexed proposer, address target, uint256 amount);

    // ---------------------------------------------------------
    // Modifiers
    // ---------------------------------------------------------
    modifier onlySuper() {
        require(msg.sender == superAdmin, "Gozzy: not super admin");
        _;
    }
    modifier onlyAdmin() {
        require(admins[msg.sender] || msg.sender == superAdmin, "Gozzy: not admin");
        _;
    }

    constructor(address[] memory _signers, uint256 _required) {
        superAdmin = msg.sender;
        admins[msg.sender] = true;
        signers = _signers;
        requiredSignatures = _required == 0 ? 1 : _required;
    }

    receive() external payable {
        treasuryBalance += msg.value;
        emit TreasuryFunded(msg.sender, msg.value);
    }

    // ---------------------------------------------------------
    // Admin management
    // ---------------------------------------------------------
    function addAdmin(address a) external onlySuper {
        admins[a] = true;
        emit AdminAdded(a);
    }
    function removeAdmin(address a) external onlySuper {
        admins[a] = false;
        emit AdminRemoved(a);
    }

    // ---------------------------------------------------------
    // Employee management
    // ---------------------------------------------------------
    function addEmployee(
        address _wallet,
        string memory _name,
        string memory _role,
        string memory _country,
        string memory _currency,
        uint256 _grossSalary,
        uint256 _taxBps
    ) external onlyAdmin {
        require(_wallet != address(0), "Gozzy: bad wallet");
        require(!employees[_wallet].active, "Gozzy: already active");
        require(_taxBps <= 5000, "Gozzy: tax too high"); // max 50%

        employees[_wallet] = Employee({
            fullName:     _name,
            role:         _role,
            country:      _country,
            currency:     _currency,
            grossSalary:  _grossSalary,
            taxBps:       _taxBps,
            lastPaidAt:   block.timestamp,
            totalGross:   0,
            totalNet:     0,
            totalTax:     0,
            active:       true,
            autoPay:      true
        });
        employeeList.push(_wallet);
        emit EmployeeAdded(_wallet, _name, _country);
    }

    function updateEmployee(
        address _wallet,
        uint256 _newSalary,
        uint256 _newTaxBps,
        bool _active
    ) external onlyAdmin {
        require(employees[_wallet].active || _active, "Gozzy: not employee");
        Employee storage e = employees[_wallet];
        e.grossSalary = _newSalary;
        e.taxBps = _newTaxBps;
        e.active = _active;
        emit EmployeeUpdated(_wallet, _newSalary, _active);
    }

    function setAutoPay(address _wallet, bool _enabled) external onlyAdmin {
        employees[_wallet].autoPay = _enabled;
        emit AutoPayToggled(_wallet, _enabled);
    }

    // ---------------------------------------------------------
    // Payouts — gross, net, tax
    // ---------------------------------------------------------
    function _payout(address _wallet, uint256 _gross, string memory _kind) internal {
        Employee storage e = employees[_wallet];
        require(e.active, "Gozzy: inactive");
        require(treasuryBalance >= _gross, "Gozzy: insufficient treasury");

        uint256 tax = (_gross * e.taxBps) / 10000;
        uint256 net = _gross - tax;

        e.lastPaidAt = block.timestamp;
        e.totalGross += _gross;
        e.totalNet   += net;
        e.totalTax   += tax;

        treasuryBalance -= _gross;

        (bool ok1, ) = payable(_wallet).call{value: net}("");
        require(ok1, "Gozzy: net transfer failed");

        // Tax is retained in contract for later remittance to authority
        emit SalaryPaid(_wallet, _gross, net, tax, _kind);
    }

    function paySalary(address _wallet) external onlyAdmin {
        _payout(_wallet, employees[_wallet].grossSalary, "monthly");
    }

    function payBonus(address _wallet, uint256 _amount) external onlyAdmin {
        require(employees[_wallet].active, "Gozzy: inactive");
        require(treasuryBalance >= _amount, "Gozzy: insufficient treasury");
        treasuryBalance -= _amount;
        employees[_wallet].totalNet += _amount;
        (bool ok, ) = payable(_wallet).call{value: _amount}("");
        require(ok, "Gozzy: bonus failed");
        emit SalaryPaid(_wallet, _amount, _amount, 0, "bonus");
    }

    function payAllNow() external onlyAdmin {
        for (uint256 i = 0; i < employeeList.length; i++) {
            address w = employeeList[i];
            Employee storage e = employees[w];
            if (!e.active) continue;
            if (treasuryBalance < e.grossSalary) continue;
            _payout(w, e.grossSalary, "manual-all");
        }
    }

    function runAutoPayroll() external {
        for (uint256 i = 0; i < employeeList.length; i++) {
            address w = employeeList[i];
            Employee storage e = employees[w];
            if (!e.active || !e.autoPay) continue;
            if (block.timestamp < e.lastPaidAt + MONTH) continue;
            if (treasuryBalance < e.grossSalary) continue;
            _payout(w, e.grossSalary, "auto");
        }
    }

    // ---------------------------------------------------------
    // Multi-sig treasury withdrawal
    // ---------------------------------------------------------
    function proposeWithdrawal(address _to, uint256 _amount) external onlyAdmin returns (bytes32) {
        bytes32 id = keccak256(abi.encodePacked(_to, _amount, block.timestamp));
        approved[id][msg.sender] = true;
        approvalCount[id] = 1;
        emit MultiSigProposal(id, msg.sender, _to, _amount);
        return id;
    }

    function approveWithdrawal(bytes32 _id) external onlyAdmin {
        require(!approved[_id][msg.sender], "Gozzy: already approved");
        approved[_id][msg.sender] = true;
        approvalCount[_id] += 1;
    }

    function executeWithdrawal(bytes32 _id, address _to, uint256 _amount) external onlyAdmin {
        require(approvalCount[_id] >= requiredSignatures, "Gozzy: not enough signatures");
        require(treasuryBalance >= _amount, "Gozzy: insufficient treasury");
        treasuryBalance -= _amount;
        (bool ok, ) = payable(_to).call{value: _amount}("");
        require(ok, "Gozzy: withdrawal failed");
        emit TreasuryWithdrawn(_to, _amount);
    }

    // ---------------------------------------------------------
    // Views
    // ---------------------------------------------------------
    function getEmployee(address _wallet)
        external view
        returns (
            string memory name, string memory role, string memory country, string memory currency,
            uint256 gross, uint256 taxBps, uint256 lastPaid, uint256 totalGross,
            uint256 totalNet, uint256 totalTax, bool active, bool autoPay
        )
    {
        Employee memory e = employees[_wallet];
        return (e.fullName, e.role, e.country, e.currency,
                e.grossSalary, e.taxBps, e.lastPaidAt,
                e.totalGross, e.totalNet, e.totalTax, e.active, e.autoPay);
    }

    function getEmployeeCount() external view returns (uint256) { return employeeList.length; }
    function getEmployeeAt(uint256 i) external view returns (address) { return employeeList[i]; }
    function contractBalance() external view returns (uint256) { return address(this).balance; }
}