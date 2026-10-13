const isDemo = window.GOZZY_DEMO_MODE === true;

function fmtMoney(cur, n){ return `${cur} ${Number(n).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`; }

function renderDemo(emp){
  document.getElementById('empName').textContent = emp.name;
  document.getElementById('empMeta').innerHTML =
    `${emp.role} · ${emp.country} · <span style="font-family:monospace">${shortAddr(emp.wallet)}</span>`;
  document.getElementById('nextPay').textContent = '31 Oct, 23:59';

  const gross = parseFloat(emp.salary);
  const taxPct = emp.tax / 100;
  const net = gross * (1 - taxPct/100) * 100 / 100; // safe math
  const netMoney = gross * (1 - emp.tax/10000);

  document.getElementById('s-gross').textContent = fmtMoney(emp.currency, gross);
  document.getElementById('s-tax').textContent   = taxPct.toFixed(2) + '%';
  document.getElementById('s-net').textContent   = fmtMoney(emp.currency, netMoney);
  document.getElementById('s-ytd').textContent   = fmtMoney(emp.currency, emp.totalNet);

  // Fake payslips — last 6 months
  const months = ['Oct 2026','Sep 2026','Aug 2026','Jul 2026','Jun 2026','May 2026'];
  const rows = months.map((m,i) => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-bottom:1px solid rgba(255,255,255,.05)">
      <div>
        <div style="font-weight:600">${m}</div>
        <div style="color:var(--muted);font-size:.78rem;font-family:monospace">tx 0x${Math.random().toString(16).slice(2,10)}...${Math.random().toString(16).slice(2,6)}</div>
      </div>
      <div style="text-align:right">
        <div style="color:var(--green);font-weight:700">${fmtMoney(emp.currency, netMoney)}</div>
        <div style="color:var(--muted);font-size:.75rem">gross ${fmtMoney(emp.currency, gross)}</div>
      </div>
      <button class="btn-mini" onclick="alert('Payslip PDF — demo')">Download</button>
    </div>`).join('');
  document.getElementById('payslips').innerHTML = rows;
  document.getElementById('payslips').style.color = '';

  document.getElementById('details').innerHTML = `
    <div class="payslip-row"><span class="k">Full name</span><span class="v">${emp.name}</span></div>
    <div class="payslip-row"><span class="k">Role</span><span class="v">${emp.role}</span></div>
    <div class="payslip-row"><span class="k">Country</span><span class="v">${emp.country}</span></div>
    <div class="payslip-row"><span class="k">Currency</span><span class="v">${emp.currency}</span></div>
    <div class="payslip-row"><span class="k">Wallet</span><span class="v" style="font-family:monospace;font-size:.8rem">${shortAddr(emp.wallet)}</span></div>
    <div class="payslip-row"><span class="k">Auto-pay</span><span class="v">${emp.auto ? '<span class="badge green">Enabled</span>' : '<span class="badge red">Off</span>'}</span></div>
    <div class="payslip-row"><span class="k">Total gross YTD</span><span class="v">${fmtMoney(emp.currency, emp.totalGross)}</span></div>
    <div class="payslip-row"><span class="k">Total tax YTD</span><span class="v">${fmtMoney(emp.currency, emp.totalTax)}</span></div>`;
}

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

async function connectWallet(){
  try{
    await gozzyConnect();
    document.getElementById('walletLabel').textContent = shortAddr(gozzyAccount);
    await renderLive();
  } catch(e){
    alert(e.message);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  if (isDemo){
    // Rotate through demo employees every 8s so reviewers see variety
    let i = 0;
    const cycle = () => { renderDemo(GOZZY_DEMO.employees[i % GOZZY_DEMO.employees.length]); i++; };
    cycle();
    setInterval(cycle, 8000);
  } else {
    await renderLive();
    if (typeof window.ethereum !== 'undefined'){
      window.ethereum.request({ method:'eth_accounts' }).then(a => {
        if (a?.length) connectWallet();
      }).catch(()=>{});
    }
  }
});