<?php require 'config.php';
if(!isset($_SESSION['admin_wallet'])){ header('Location: index.php'); exit; }
?>
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Gozzy Admin Dashboard</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<style>
body{background:#0b0b1a;color:#eaeaf5;font-family:system-ui,sans-serif}
.navbar-g{background:rgba(255,215,0,.05);border-bottom:1px solid rgba(255,215,0,.2)}
.brand-g{font-weight:800;background:linear-gradient(45deg,#f7971e,#ffd200);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.card-g{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:22px}
.stat{padding:20px;border-radius:16px;background:linear-gradient(135deg,rgba(255,215,0,.1),rgba(255,215,0,.02));border:1px solid rgba(255,215,0,.2)}
.stat h3{margin:0;font-size:1.6rem;color:#ffd200}
.btn-g{background:linear-gradient(45deg,#f7971e,#ffd200);color:#111;font-weight:700;border-radius:50px;border:0;padding:8px 18px}
.btn-g:hover{opacity:.9}
.btn-outline-g{border:1px solid #ffd200;color:#ffd200;border-radius:50px;background:transparent;padding:6px 14px}
.btn-outline-g:hover{background:#ffd200;color:#111}
table{color:#eaeaf5}
.table>:not(caption)>*>*{background:transparent;color:#eaeaf5;border-color:rgba(255,255,255,.08)}
</style>
</head>
<body>
<nav class="navbar-g p-3 d-flex justify-content-between align-items-center">
  <div class="brand-g fs-4"><i class="fas fa-coins me-2"></i>Gozzy Payroll — Admin</div>
  <div>
    <span class="me-3 text-muted small" id="walletLabel">Not connected</span>
    <button class="btn-g" onclick="connectWallet()">Connect</button>
    <a href="logout.php" class="btn btn-outline-g ms-2">Logout</a>
  </div>
</nav>

<div class="container py-4">
  <div class="row g-3 mb-4">
    <div class="col-md-3"><div class="stat"><small class="text-muted">Contract Balance</small><h3 id="balance">— ETH</h3></div></div>
    <div class="col-md-3"><div class="stat"><small class="text-muted">Employees</small><h3 id="empCount">—</h3></div></div>
    <div class="col-md-3"><div class="stat"><small class="text-muted">Total Payroll / mo</small><h3 id="payrollTotal">— ETH</h3></div></div>
    <div class="col-md-3"><div class="stat"><small class="text-muted">Auto-Pay Status</small><h3 id="autoStatus">Idle</h3></div></div>
  </div>

  <div class="card-g mb-4">
    <h5 class="mb-3"><i class="fas fa-plus-circle me-2 text-warning"></i>Add Employee</h5>
    <div class="row g-2">
      <div class="col-md-3"><input id="empName" class="form-control" placeholder="Full name"></div>
      <div class="col-md-2"><input id="empRole" class="form-control" placeholder="Role"></div>
      <div class="col-md-3"><input id="empWallet" class="form-control" placeholder="0x wallet address"></div>
      <div class="col-md-2"><input id="empSalary" class="form-control" placeholder="Salary ETH / mo"></div>
      <div class="col-md-2"><button class="btn-g w-100" onclick="addEmployee()">Add</button></div>
    </div>
  </div>

  <div class="card-g mb-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="fas fa-users me-2 text-warning"></i>Employees</h5>
      <div>
        <input id="depositAmt" class="form-control d-inline-block me-2" style="width:130px" placeholder="ETH to deposit">
        <button class="btn-outline-g me-2" onclick="depositFunds()">Deposit to Contract</button>
        <button class="btn-outline-g me-2" onclick="payAll()">Pay All Now</button>
        <button class="btn-g" onclick="runAuto()">Run Auto-Payroll</button>
      </div>
    </div>
    <div class="table-responsive">
      <table class="table align-middle">
        <thead><tr><th>Name</th><th>Role</th><th>Wallet</th><th>Salary (ETH)</th><th>Last Paid</th><th>Total Received</th><th>Auto</th><th>Actions</th></tr></thead>
        <tbody id="empTable"><tr><td colspan="8" class="text-muted text-center">Connect wallet to load</td></tr></tbody>
      </table>
    </div>
  </div>

  <div id="log" class="small text-muted"></div>
</div>

<script>
window.GOZZY_CONTRACT_ADDRESS = "<?= GOZZY_CONTRACT ?>";
window.GOZZY_ABI = <?= $GOZZY_ABI ?>;
window.GOZZY_CHAIN_ID = "<?= GOZZY_CHAIN_ID ?>";
window.GOZZY_NETWORK_NAME = "<?= GOZZY_NETWORK_NAME ?>";
</script>
<script src="https://cdn.jsdelivr.net/npm/web3@1.8.0/dist/web3.min.js"></script>
<script src="assets/js/web3-handler.js"></script>
<script>
function log(msg, cls='text-muted'){ document.getElementById('log').innerHTML = `<span class="${cls}">${msg}</span>`; }

async function connectWallet(){
  try{
    await gozzyConnect();
    document.getElementById('walletLabel').textContent = shortAddr(gozzyAccount);
    await loadAll();
  }catch(e){ alert(e.message); }
}

async function loadAll(){
  // Contract balance
  const bal = await gozzyWeb3.eth.getBalance(GOZZY_CONFIG.contract);
  document.getElementById('balance').textContent = gozzyWeb3.utils.fromWei(bal,'ether') + ' ETH';

  // Employees
  const count = await gozzyContract.methods.getEmployeeCount().call();
  document.getElementById('empCount').textContent = count;

  const tbody = document.getElementById('empTable');
  tbody.innerHTML = '';
  let total = 0;

  for(let i=0;i<count;i++){
    const w = await gozzyContract.methods.getEmployeeAt(i).call();
    const e = await gozzyContract.methods.getEmployee(w).call();
    const salaryEth = gozzyWeb3.utils.fromWei(e[2],'ether');
    const totalEth  = gozzyWeb3.utils.fromWei(e[4],'ether');
    const lastPaid  = new Date(Number(e[3])*1000).toLocaleDateString();
    const auto = await gozzyContract.methods.autoPayEnabled(w).call();
    total += parseFloat(salaryEth);

    tbody.innerHTML += `
      <tr>
        <td>${e[0]}</td>
        <td>${e[1]}</td>
        <td class="small">${shortAddr(w)}</td>
        <td>${salaryEth}</td>
        <td>${lastPaid}</td>
        <td>${totalEth}</td>
        <td><input type="checkbox" ${auto?'checked':''} onchange="toggleAuto('${w}', this.checked)"></td>
        <td>
          <button class="btn-outline-g me-1" onclick="payOne('${w}')">Pay</button>
          <button class="btn-outline-g" onclick="payBonus('${w}')">Bonus</button>
        </td>
      </tr>`;
  }
  document.getElementById('payrollTotal').textContent = total.toFixed(4) + ' ETH';
}

async function addEmployee(){
  const name = empName.value.trim();
  const role = empRole.value.trim();
  const wallet = empWallet.value.trim();
  const salary = empSalary.value.trim();
  if(!name||!wallet||!salary) return alert('Fill all fields');
  try{
    log('Confirm in MetaMask...');
    await gozzyAddEmployee(wallet, name, role, salary);
    // Save to DB
    await fetch('api-save-employee.php',{method:'POST',headers:{'Content-Type':'application/json'},
      body: JSON.stringify({name, role, wallet, salary})});
    log('✅ Employee added', 'text-success');
    empName.value=empRole.value=empWallet.value=empSalary.value='';
    await loadAll();
  }catch(e){ log('❌ '+e.message, 'text-danger'); }
}

async function payOne(w){
  try{ log('Paying salary...'); await gozzyPaySalary(w); log('✅ Paid','text-success'); await loadAll(); }
  catch(e){ log('❌ '+e.message,'text-danger'); }
}
async function payBonus(w){
  const amt = prompt('Bonus amount in ETH:');
  if(!amt) return;
  try{ await gozzyPayBonus(w, amt); log('✅ Bonus paid','text-success'); await loadAll(); }
  catch(e){ log('❌ '+e.message,'text-danger'); }
}
async function payAll(){
  try{ log('Paying everyone...'); await gozzyPayAll(); log('✅ Done','text-success'); await loadAll(); }
  catch(e){ log('❌ '+e.message,'text-danger'); }
}
async function runAuto(){
  try{ document.getElementById('autoStatus').textContent='Running...'; await gozzyRunAuto(); document.getElementById('autoStatus').textContent='Done'; await loadAll(); }
  catch(e){ log('❌ '+e.message,'text-danger'); }
}
async function toggleAuto(w, en){
  try{ await gozzyToggleAuto(w, en); log('Auto-pay updated','text-success'); }
  catch(e){ log('❌ '+e.message,'text-danger'); }
}
async function depositFunds(){
  const amt = depositAmt.value.trim();
  if(!amt) return alert('Enter ETH');
  try{ await gozzyDeposit(amt); log('✅ Deposited','text-success'); depositAmt.value=''; await loadAll(); }
  catch(e){ log('❌ '+e.message,'text-danger'); }
}
</script>
</body>
</html>