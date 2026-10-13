<?php require 'config.php';
$demo = isset($_GET['demo']) && $_GET['demo'] == '1';
?>
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Employee Terminal · Gozzy Group</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<link rel="stylesheet" href="assets/css/gozzy.css">
<style>
  .payslip-row{display:flex;justify-content:space-between;padding:14px 0;border-bottom:1px solid rgba(255,255,255,.05)}
  .payslip-row:last-child{border:0}
  .payslip-row .k{color:var(--muted)}
  .payslip-row .v{font-weight:600}
</style>
</head>
<body>

<nav class="nav-g">
  <div class="brand-g">
    <div class="brand-logo">G</div>
    <span class="brand-name">Gozzy Group</span>
    <span style="color:var(--muted);margin-left:8px;font-weight:500;font-size:.85rem">/ Employee Terminal</span>
  </div>
  <div style="display:flex;gap:10px;align-items:center">
    <span class="badge <?= $demo ? 'blue' : 'gold' ?>"><?= $demo ? 'DEMO MODE' : 'LIVE MODE' ?></span>
    <span id="walletLabel" style="color:var(--muted);font-size:.8rem">Not connected</span>
    <?php if($demo): ?>
      <a href="employee.php" class="btn-ghost" style="padding:8px 16px;font-size:.85rem">Go Live</a>
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
    <span><?= $demo ? 'Demo sandbox · simulated payslips' : 'Live on Sepolia · verified payslips' ?></span>
  </div>

  <!-- Greeting -->
  <div class="card-g" style="margin-bottom:20px">
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px">
      <div>
        <div style="color:var(--muted);font-size:.8rem;text-transform:uppercase;letter-spacing:.06em">Welcome back</div>
        <h2 id="empName" style="margin:6px 0 4px;font-size:1.6rem">Loading...</h2>
        <div id="empMeta" style="color:var(--muted);font-size:.9rem"></div>
      </div>
      <div style="text-align:right">
        <div style="color:var(--muted);font-size:.75rem;text-transform:uppercase;letter-spacing:.06em">Next payment</div>
        <div style="font-size:1.15rem;font-weight:700;color:var(--gold)" id="nextPay">—</div>
      </div>
    </div>
  </div>

  <!-- Top stats -->
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:20px">
    <div class="stat"><small>Monthly Gross</small><h3 id="s-gross">—</h3></div>
    <div class="stat"><small>Tax Rate</small><h3 id="s-tax">—</h3></div>
    <div class="stat"><small>Net Take-Home</small><h3 id="s-net">—</h3></div>
    <div class="stat"><small>YTD Received</small><h3 id="s-ytd">—</h3></div>
  </div>

  <!-- Two-column -->
  <div style="display:grid;grid-template-columns:2fr 1fr;gap:20px">
    <div class="card-g">
      <h3 style="margin:0 0 14px;font-size:1.05rem"><i class="fas fa-receipt" style="color:var(--gold)"></i> Payslip History</h3>
      <div id="payslips" style="color:var(--muted);font-size:.9rem">Loading...</div>
    </div>

    <div class="card-g">
      <h3 style="margin:0 0 14px;font-size:1.05rem"><i class="fas fa-id-card" style="color:var(--gold)"></i> Employment Details</h3>
      <div id="details"></div>
    </div>
  </div>
</div>

<div id="log"></div>

<script>
window.GOZZY_CONTRACT_ADDRESS = "<?= GOZZY_CONTRACT ?>";
window.GOZZY_ABI              = <?= $GOZZY_ABI ?>;
window.GOZZY_CHAIN_ID         = "<?= GOZZY_CHAIN_ID ?>";
window.GOZZY_NETWORK_NAME     = "<?= GOZZY_NETWORK_NAME ?>";
window.GOZZY_DEMO_MODE        = <?= $demo ? 'true' : 'false' ?>;
</script>
<script src="https://cdn.jsdelivr.net/npm/web3@1.8.0/dist/web3.min.js"></script>
<script src="assets/js/demo-data.js"></script>
<script src="assets/js/demo-engine.js"></script>   <!-- NEW -->
<script src="assets/js/web3-handler.js"></script>
<script src="assets/js/employee-terminal.js"></script>
</body>
</html>
