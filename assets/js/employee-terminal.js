// ============================================================
// Employee Terminal — Demo (realistic) + Live
// ============================================================
const isDemo = window.GOZZY_DEMO_MODE === true;
let currentDemoEmployee = null;
let demoTxList = [];
let demoBalance = 0;

function fmt(n, d=2){ return Number(n).toLocaleString(undefined,{minimumFractionDigits:d,maximumFractionDigits:d}); }
function fmtMoney(cur, n){ return `${cur} ${fmt(n)}`; }
function shortAddr(a){ return a ? a.slice(0,6)+'...'+a.slice(-4) : ''; }

// ---------- Demo ----------
function renderDemo(emp){
  currentDemoEmployee = emp;

  document.getElementById('empName').textContent = emp.name;
  document.getElementById('empMeta').innerHTML =
    `${emp.role} · ${emp.country} · <span style="font-family:monospace">${shortAddr(emp.wallet)}</span>`;
  document.getElementById('nextPay').textContent = '31 Oct, 23:59';

  const gross   = parseFloat(emp.salary);
  const taxPct  = emp.tax / 100;
  const net     = gross * (1 - emp.tax/10000);

  // Pull realistic history (auto-generated for each employee)
  demoTxList = GOZZY_DEMO.historyFor(emp.wallet);
  const ytd = demoTxList.reduce((s, t) => s + (t.kind === "Salary" ? t.net : 0), 0);

  document.getElementById('s-gross').textContent = fmtMoney(emp.currency, gross);
  document.getElementById('s-tax').textContent   = taxPct.toFixed(2) + '%';
  document.getElementById('s-net').textContent   = fmtMoney(emp.currency, net);
  document.getElementById('s-ytd').textContent   = fmtMoney(emp.currency, ytd);

  // Payslip history
  const rows = demoTxList.map(tx => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-bottom:1px solid rgba(255,255,255,.05)">
      <div>
        <div style="font-weight:600">${tx.t.split(' ')[0]}</div>
        <div style="color:var(--muted);font-size:.78rem;font-family:monospace">${tx.tx}</div>
      </div>
      <div style="text-align:center">
        <span class="badge ${tx.kind === 'Bonus' ? 'gold' : 'green'}">${tx.kind}</span>
      </div>
      <div style="text-align:right">
        <div style="color:var(--green);font-weight:700">${fmtMoney(emp.currency, tx.net)}</div>
        <div style="color:var(--muted);font-size:.75rem">gross ${fmtMoney(emp.currency, tx.gross)}</div>
      </div>
      <button class="btn-mini" onclick="downloadPayslip('${tx.t}')">Download</button>
    </div>`).join('');

  document.getElementById('payslips').innerHTML = rows || `<div style="padding:20px 0;color:var(--muted)">No payslips yet.</div>`;
  document.getElementById('payslips').style.color = '';

  document.getElementById('details').innerHTML = `
    <div class="payslip-row"><span class="k">Full name</span><span class="v">${emp.name}</span></div>
    <div class="payslip-row"><span class="k">Role</span><span class="v">${emp.role}</span></div>
    <div class="payslip-row"><span class="k">Country</span><span class="v">${emp.country}</span></div>
    <div class="payslip-row"><span class="k">Currency</span><span class="v">${emp.currency}</span></div>
    <div class="payslip-row"><span class="k">Wallet</span><span class="v" style="font-family:monospace;font-size:.78rem">${shortAddr(emp.wallet)}</span></div>
    <div class="payslip-row"><span class="k">Auto-pay</span><span class="v">${emp.auto ? '<span class="badge green">Enabled</span>' : '<span class="badge red">Off</span>'}</span></div>
    <div class="payslip-row"><span class="k">Total net YTD</span><span class="v">${fmtMoney(emp.currency, ytd)}</span></div>`;
}

function downloadPayslip(month){
  alert(`📄 Payslip ${month}\n\n(A demo PDF would download here in production.)`);
}

// ---------- Live ----------
async function renderLive(){
  if (!isReady()){
    document.getElementById('empName').textContent = 'Connect your wallet';
    document.getElementById('empMeta').textContent = 'Your payslips will appear here.';
    document.getElementById('payslips').innerHTML = '<div style="padding:20px 0">Connect wallet to load payslips.</div>';
    return;
  }
  const w3 = gozzyWeb3;
  const e = await gozzyContract.methods.getEmployee(gozzyAccount).call();
  const gross = parseFloat(w3.utils.fromWei(e[4],'ether'));
  const net   = parseFloat(w3.utils.fromWei(e[8],'ether'));
  const tax   = parseFloat(w3.utils.fromWei(e[9],'ether'));
  const taxPct = e[5] / 100;

  document.getElementById('empName').textContent = e[0] || 'Unnamed Employee';
  document.getElementById('empMeta').innerHTML = `${e[1]} · ${e[2]} · <span style="font-family:monospace">${shortAddr(gozzyAccount)}</span>`;
  document.getElementById('nextPay').textContent = new Date((Number(e[6])+2592000)*1000).toLocaleDateString();

  document.getElementById('s-gross').textContent = fmtMoney(e[3], gross);
  document.getElementById('s-tax').textContent   = taxPct.toFixed(2)+'%';
  document.getElementById('s-net').textContent   = fmtMoney(e[3], gross * (1 - e[5]/10000));
  document.getElementById('s-ytd').textContent   = fmtMoney(e[3], net);

  document.getElementById('payslips').innerHTML = `
    <div style="padding:14px 0;color:var(--muted)">
      Last paid: ${new Date(Number(e[6])*1000).toLocaleDateString()}<br>
      Total gross YTD: ${fmtMoney(e[3], parseFloat(w3.utils.fromWei(e[7],'ether')))}<br>
      Total tax YTD: ${fmtMoney(e[3], tax)}<br>
      <span style="font-size:.8rem">Full on-chain payslip history available via events.</span>
    </div>`;

  document.getElementById('details').innerHTML = `
    <div class="payslip-row"><span class="k">Name</span><span class="v">${e[0]}</span></div>
    <div class="payslip-row"><span class="k">Role</span><span class="v">${e[1]}</span></div>
    <div class="payslip-row"><span class="k">Country</span><span class="v">${e[2]}</span></div>
    <div class="payslip-row"><span class="k">Currency</span><span class="v">${e[3]}</span></div>
    <div class="payslip-row"><span class="k">Auto-pay</span><span class="v">${e[11] ? '<span class="badge green">On</span>' : '<span class="badge red">Off</span>'}</span></div>`;
}

// ---------- Connect ----------
async function connectWallet(){
  if (isDemo){
    try{
      await GozzyDemo.connect({ role: 'employee' });
      document.getElementById('walletLabel').textContent = shortAddr(GozzyDemo.getAddress());
      // Pick the employee whose wallet matched OR a random one
      const matched = GOZZY_DEMO.employees.find(e =>
        e.wallet.toLowerCase() === GozzyDemo.getAddress().toLowerCase());
      const emp = matched || GOZZY_DEMO.employees[Math.floor(Math.random()*GOZZY_DEMO.employees.length)];
      renderDemo(emp);
      return;
    } catch(e){
      alert(e.message);
      return;
    }
  }

  // Live — unchanged
  try{
    await gozzyConnect();
    document.getElementById('walletLabel').textContent = shortAddr(gozzyAccount);
    await renderLive();
  } catch(e){
    alert(e.message);
  }
}

// ---------- Boot ----------
document.addEventListener('DOMContentLoaded', async () => {
  if (isDemo){
    // No auto connect — wait for user click (feels more real)
    document.getElementById('empName').textContent = 'Connect wallet to view payslips';
    document.getElementById('empMeta').textContent = 'Click "Connect Wallet" above to load your demo payslips.';
    // Show a random employee name in grey behind the CTA so it feels populated
    const preview = GOZZY_DEMO.employees[0];
    document.getElementById('nextPay').textContent = '31 Oct, 23:59';
    document.getElementById('payslips').innerHTML =
      `<div style="padding:20px 0;color:var(--muted)">Your demo payslips will appear here after connecting.</div>`;
    document.getElementById('details').innerHTML =
      `<div class="payslip-row"><span class="k">Status</span><span class="v">Awaiting wallet</span></div>
       <div class="payslip-row"><span class="k">Network</span><span class="v">Sepolia Testnet</span></div>
       <div class="payslip-row"><span class="k">Company</span><span class="v">Gozzy Group Holdings</span></div>`;
  } else {
    await renderLive();
    if (typeof window.ethereum !== 'undefined'){
      window.ethereum.request({ method:'eth_accounts' }).then(a => {
        if (a?.length) connectWallet();
      }).catch(()=>{});
    }
  }
});
