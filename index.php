<?php require 'config.php'; ?>
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Gozzy Group — Global Payroll, On-Chain</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<link rel="stylesheet" href="assets/css/gozzy.css">
<style>
  .hero{padding:100px 24px 40px;text-align:center;max-width:1100px;margin:0 auto}
  .hero h1{
    font-size:clamp(2.4rem,5vw,4rem);font-weight:900;line-height:1.05;
    background:linear-gradient(135deg,#fff 20%,var(--gold) 100%);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
    margin:0 0 20px;
  }
  .hero p{color:var(--muted);font-size:1.15rem;max-width:640px;margin:0 auto 40px;line-height:1.6}
  .term-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;max-width:900px;margin:0 auto}
  @media(max-width:720px){.term-grid{grid-template-columns:1fr}}
  .term{
    background:var(--card);border:1px solid var(--line);border-radius:24px;
    padding:36px 28px;text-align:left;position:relative;overflow:hidden;
    transition:all .3s ease;cursor:pointer;
  }
  .term:hover{transform:translateY(-4px);border-color:rgba(255,210,0,.4);box-shadow:0 20px 50px rgba(255,210,0,.12)}
  .term .ico{
    width:54px;height:54px;border-radius:16px;display:flex;align-items:center;justify-content:center;
    background:linear-gradient(135deg,var(--gold-2),var(--gold));
    color:#0b0b18;font-size:1.4rem;margin-bottom:20px;
  }
  .term.admin .ico{background:linear-gradient(135deg,#f7971e,#ffd200)}
  .term.emp .ico{background:linear-gradient(135deg,#4aa8ff,#00e28a)}
  .term h3{font-size:1.35rem;margin:0 0 8px;font-weight:800}
  .term p{color:var(--muted);font-size:.9rem;margin:0 0 24px;line-height:1.6}
  .term .btns{display:flex;gap:10px;flex-wrap:wrap}
  .features{max-width:1100px;margin:80px auto 40px;display:grid;grid-template-columns:repeat(3,1fr);gap:20px;padding:0 24px}
  @media(max-width:900px){.features{grid-template-columns:1fr 1fr}}
  @media(max-width:600px){.features{grid-template-columns:1fr}}
  .feature{padding:22px;border-radius:16px;background:var(--card);border:1px solid var(--line)}
  .feature i{color:var(--gold);font-size:1.4rem;margin-bottom:12px}
  .feature h4{margin:0 0 6px;font-size:1rem}
  .feature p{color:var(--muted);font-size:.85rem;margin:0;line-height:1.5}
  footer{text-align:center;color:var(--muted);font-size:.8rem;padding:60px 24px 30px}
</style>
</head>
<body>

<nav class="nav-g">
  <div class="brand-g">
    <div class="brand-logo">G</div>
    <span class="brand-name">Gozzy Group</span>
  </div>
  <div style="display:flex;gap:10px;align-items:center">
    <span style="color:var(--muted);font-size:.8rem"><i class="fas fa-circle" style="color:var(--green);font-size:.5rem;margin-right:6px"></i>Sepolia Live</span>
  </div>
</nav>

<section class="hero">
  <div style="display:inline-block;padding:6px 16px;border-radius:999px;background:rgba(255,210,0,.08);border:1px solid rgba(255,210,0,.25);font-size:.75rem;color:var(--gold);font-weight:600;margin-bottom:24px;letter-spacing:.05em">
    <i class="fas fa-shield-halved"></i> &nbsp;SECURED PAYROLL 
  </div>
  <h1>Global payroll.<br>Settled on-chain.</h1>
  <p>Gozzy Group pays distributed teams in stable value, automatically at month-end. Multi-currency, tax-compliant, fully auditable — powered by smart contracts.</p>

  <div class="term-grid">
    <!-- ADMIN TERMINAL -->
    <div class="term admin" onclick="location.href='admin.php?demo=1'">
      <div class="ico"><i class="fas fa-briefcase"></i></div>
      <h3>Admin Terminal</h3>
      <p>Run payroll, add employees, pay bonuses, manage treasury, and review the full audit trail.</p>
      <div class="btns">
        <button class="btn-g" onclick="event.stopPropagation();location.href='admin.php?demo=1'">
          <i class="fas fa-play"></i> Try Demo
        </button>
        <button class="btn-ghost" onclick="event.stopPropagation();location.href='admin.php'">
          <i class="fas fa-wallet"></i> Live Mode
        </button>
      </div>
    </div>

    <!-- EMPLOYEE TERMINAL -->
    <div class="term emp" onclick="location.href='employee.php?demo=1'">
      <div class="ico"><i class="fas fa-user-tie"></i></div>
      <h3>Employee Terminal</h3>
      <p>View your payslips, salary history, tax withheld, and next payment date. Fully transparent.</p>
      <div class="btns">
        <button class="btn-g" onclick="event.stopPropagation();location.href='employee.php?demo=1'">
          <i class="fas fa-play"></i> Try Demo
        </button>
        <button class="btn-ghost" onclick="event.stopPropagation();location.href='employee.php'">
          <i class="fas fa-wallet"></i> Live Mode
        </button>
      </div>
    </div>
  </div>
</section>

<section class="features">
  <div class="feature"><i class="fas fa-globe"></i><h4>Multi-Currency</h4><p>USD, EUR, GBP, NGN — settle in the currency each employee expects.</p></div>
  <div class="feature"><i class="fas fa-clock"></i><h4>Auto Month-End</h4><p>Salaries disburse automatically on the last day of every month. No human clicks.</p></div>
  <div class="feature"><i class="fas fa-calculator"></i><h4>Tax Withholding</h4><p>Per-employee tax rates held in escrow and remitted to authorities.</p></div>
  <div class="feature"><i class="fas fa-multisig"></i><h4>Multi-Sig Treasury</h4><p>M-of-N approvals required to move company funds. No single point of failure.</p></div>
  <div class="feature"><i class="fas fa-file-invoice"></i><h4>On-Chain Payslips</h4><p>Every payment recorded on-chain with gross, net, and tax breakdown.</p></div>
  <div class="feature"><i class="fas fa-award"></i><h4>Bonuses & Vesting</h4><p>Spot bonuses, performance awards, and vesting schedules — all programmable.</p></div>
</section>

<footer>
  © <?= date('Y') ?> Gozzy Group Holdings · Smart Contract Payroll · <a href="#">Compliance</a> · <a href="#">Security</a>
</footer>

</body>
</html>