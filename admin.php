<?php require 'config.php';
$demo = isset($_GET['demo']) && $_GET['demo'] == '1';
?>
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Admin Terminal · Gozzy Group</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<link rel="stylesheet" href="assets/css/gozzy.css">
</head>
<body>

<nav class="nav-g">
  <div class="brand-g">
    <div class="brand-logo">G</div>
    <span class="brand-name">Gozzy Group</span>
    <span style="color:var(--muted);margin-left:8px;font-weight:500;font-size:.85rem">/ Admin Terminal</span>
  </div>
  <div style="display:flex;gap:10px;align-items:center">
    <span id="modeBadge" class="badge <?= $demo ? 'blue' : 'gold' ?>">
      <?= $demo ? 'DEMO MODE' : 'LIVE MODE' ?>
    </span>
    <span id="walletLabel" style="color:var(--muted);font-size:.8rem">Not connected</span>
    <?php if($demo): ?>
      <a href="admin.php" class="btn-ghost" style="padding:8px 16px;font-size:.85rem">Go Live</a>
    <?php else: ?>
      <button class="btn-g" style="padding:8px 18px;font-size:.85rem" onclick="connectWallet()">
        <i class="fas fa-wallet"></i> Connect
      </button>
    <?php endif; ?>
    <a href="index.php" class="btn-ghost" style="padding:8px 16px;font-size:.85rem">Exit</a>
  </div>
</nav>

<div class="container-g">
  <div class="terminal-strip">
    <span class="dot <?= $demo ? 'demo' : '' ?>"></span>
    <span><?= $demo ? 'Demo sandbox · simulated data' : 'Live on Sepolia · real transactions' ?></span>
  </div>

  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px">
    <div class="stat"><small>Treasury Balance</small><h3 id="s-treasury">—</h3></div>
    <div class="stat"><small>Headcount</small><h3 id="s-count">—</h3></div>
    <div class="stat"><small>Monthly Payroll</small><h3 id="s-payroll">—</h3></div>
    <div class="stat"><small>Next Auto-Run</small><h3 id="s-next">—</h3></div>
  </div>

  <!-- Fund + Batch Actions -->
  <div class="card-g" style="margin-bottom:20px">
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
      <div>
        <h3 style="margin:0;font-size:1.05rem"><i class="fas fa-vault" style="color:var(--gold)"></i> Treasury Operations</h3>
        <p style="color:var(--muted);font-size:.85rem;margin:6px 0 0">Fund payroll pool, run batch payments, trigger auto-payroll.</p>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <input id="depositAmt" class="inp" style="width:130px" placeholder="ETH amount">
        <button class="btn-ghost" onclick="depositFunds()"><i class="fas fa-plus"></i> Fund Treasury</button>
        <button class="btn-ghost" onclick="payAll()"><i class="fas fa-bolt"></i> Pay All Now</button>
        <button class="btn-g" onclick="runAuto()"><i class="fas fa-robot"></i> Run Auto-Payroll</button>
      </div>
    </div>
  </div>

  <!-- Add Employee -->
  <div class="card-g" style="margin-bottom:20px">
    <h3 style="margin:0 0 16px;font-size:1.05rem"><i class="fas fa-user-plus" style="color:var(--gold)"></i> Add Employee</h3>
    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:10px" id="addForm">
      <div><label class="lbl">Name</label><input id="empName" class="inp" placeholder="Full name"></div>
      <div><label class="lbl">Role</label><input id="empRole" class="inp" placeholder="Job title"></div>
      <div><label class="lbl">Country</label>
        <select id="empCountry" class="inp">
          <option>NG</option><option>US</option><option>GB</option><option>DE</option>
          <option>IE</option><option>IN</option><option>JP</option><option>AE</option>
          <option>MX</option><option>IT</option>
        </select>
      </div>
      <div><label class="lbl">Currency</label>
        <select id="empCurrency" class="inp">
          <option>USD</option><option>EUR</option><option>GBP</option><option>NGN</option>
        </select>
      </div>
      <div><label class="lbl">Monthly Salary</label><input id="empSalary" class="inp" placeholder="e.g. 4500"></div>
      <div><label class="lbl">Tax %</label><input id="empTax" class="inp" placeholder="7.5" value="7.5"></div>
      <div><label class="lbl">Wallet</label><input id="empWallet" class="inp" placeholder="0x..."></div>
    </div>
    <div style="margin-top:14px;display:flex;gap:10px;align-items:center">
      <button class="btn-g" onclick="addEmployee()"><i class="fas fa-plus"></i> Add to Payroll</button>
      <span style="color:var(--muted);font-size:.8rem">Tax is withheld on-chain and held in escrow.</span>
    </div>
  </div>

  <!-- Employee Table -->
  <div class="card-g">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
      <h3 style="margin:0;font-size:1.05rem"><i class="fas fa-users" style="color:var(--gold)"></i> Active Employees</h3>
      <input id="search" class="inp" style="width:220px" placeholder="Search name, role, wallet..." oninput="renderEmployees()">
    </div>
    <div style="overflow-x:auto">
      <table class="tbl">
        <thead>
          <tr>
            <th>Name</th><th>Role</th><th>Country</th><th>Wallet</th>
            <th>Gross</th><th>Tax</th><th>Net</th><th>Status</th><th>Auto</th><th>Actions</th>
          </tr>
        </thead>
        <tbody id="empTbody"></tbody>
      </table>
    </div>
  </div>

  <!-- Audit Trail -->
  <div class="card-g" style="margin-top:20px">
    <h3 style="margin:0 0 14px;font-size:1.05rem"><i class="fas fa-history" style="color:var(--gold)"></i> Audit Trail</h3>
    <div id="auditList" style="font-size:.85rem"></div>
  </div>
</div>

<div id="log"></div>

<!-- ABI / config -->
<script>
window.GOZZY_CONTRACT_ADDRESS = "<?= GOZZY_CONTRACT ?>";
window.GOZZY_ABI              = <?= $GOZZY_ABI ?>;
window.GOZZY_CHAIN_ID         = "<?= GOZZY_CHAIN_ID ?>";
window.GOZZY_NETWORK_NAME     = "<?= GOZZY_NETWORK_NAME ?>";
window.GOZZY_DEMO_MODE        = <?= $demo ? 'true' : 'false' ?>;
</script>
<script src="https://cdn.jsdelivr.net/npm/web3@1.8.0/dist/web3.min.js"></script>
<script src="assets/js/demo-data.js"></script>
<script src="assets/js/web3-handler.js"></script>
<script src="assets/js/admin-terminal.js"></script>
</body>
</html>