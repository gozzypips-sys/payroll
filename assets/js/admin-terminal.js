// ============================================================
// Admin Terminal — Demo (realistic) + Live
// ============================================================
const isDemo = window.GOZZY_DEMO_MODE === true;
let liveEmployees = [];

// ---------- shared ----------
function shortAddr(a){ return a ? a.slice(0,6)+'...'+a.slice(-4) : ''; }
function fmt(n, d=2){ return Number(n).toLocaleString(undefined,{minimumFractionDigits:d,maximumFractionDigits:d}); }
function badge(text, cls){ return `<span class="badge ${cls}">${text}</span>`; }

function log(msg, cls=''){
  const el = document.getElementById('log');
  el.style.display = 'block';
  const color = cls==='error' ? 'var(--red)' : cls==='ok' ? 'var(--green)' : 'var(--muted)';
  el.innerHTML = `<span style="color:${color}">${msg}</span>`;
  clearTimeout(window.__logT);
  window.__logT = setTimeout(()=> el.style.display='none', 6000);
}

// ---------- Demo state (mirrors real contract for realism) ----------
const demoState = {
  treasury: GOZZY_DEMO.company.treasury,
  connected: false,
  address: null,
  employees: [],   // deep copy so we can mutate
};

function initDemoState(){
  demoState.employees = GOZZY_DEMO.employees.map(e => ({
    ...e,
    lastPaid: "2026-09-30",
    totalGross: parseFloat(e.salary) * 9,
    totalNet: parseFloat(e.salary) * 9 * (1 - e.tax/10000),
    totalTax: parseFloat(e.salary) * 9 * (e.tax/10000),
    ytdNet: parseFloat(e.salary) * 9 * (1 - e.tax/10000),
  }));
}
initDemoState();

// ---------- RENDER ----------
function renderEmployees(){
  const tb = document.getElementById('empTbody');
  const q  = (document.getElementById('search').value || '').toLowerCase();
  const rows = isDemo ? demoState.employees : liveEmployees;

  const filtered = rows.filter(r =>
    !q || (r.name + r.role + r.wallet + r.country).toLowerCase().includes(q));

  if (!filtered.length){
    tb.innerHTML = `<tr><td colspan="10" style="text-align:center;color:var(--muted);padding:30px">
      ${isDemo ? 'No matches.' : 'Connect wallet to load employees.'}
    </td></tr>`;
    return;
  }

  tb.innerHTML = filtered.map(e => {
    const gross  = parseFloat(e.salary);
    const taxPct = isDemo ? (e.tax/100).toFixed(2) : (e.tax/100).toFixed(2);
    const net    = (gross * (1 - (e.tax/10000))).toFixed(2);
    return `
    <tr>
      <td style="font-weight:600">${e.name}</td>
      <td style="color:var(--muted)">${e.role}</td>
      <td>${badge(e.country,'blue')}</td>
      <td style="font-family:monospace;font-size:.78rem">${shortAddr(e.wallet)}</td>
      <td>${e.currency} ${fmt(gross)}</td>
      <td style="color:var(--muted)">${taxPct}%</td>
      <td style="color:var(--green);font-weight:600">${e.currency} ${fmt(net)}</td>
      <td>${e.active ? badge('Active','green') : badge('Inactive','red')}</td>
      <td>${e.auto ? '<i class="fas fa-circle-check" style="color:var(--green)"></i>' :
                    '<i class="fas fa-circle-xmark" style="color:var(--muted)"></i>'}</td>
      <td>
        <button class="btn-mini" onclick="payOne('${e.wallet}','${e.name}')">Pay</button>
        <button class="btn-mini blue" onclick="payBonus('${e.wallet}','${e.name}')">Bonus</button>
      </td>
    </tr>`;
  }).join('');
}

function renderAudit(){
  const list = document.getElementById('auditList');
  if (isDemo){
    list.innerHTML = GOZZY_DEMO.audit.map(a => `
      <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.04)">
        <div>
          <span style="color:var(--muted);font-family:monospace">${a.t}</span>
          &nbsp; ${badge(a.kind,'gold')}
          &nbsp; <b>${a.who}</b>
          &nbsp; <span style="color:var(--muted);font-size:.78rem">${a.country}</span>
        </div>
        <div style="text-align:right">
          <b style="color:var(--green)">${a.cur} ${fmt(a.amt)}</b>
          <div style="color:var(--muted);font-family:monospace;font-size:.75rem">${a.tx}</div>
        </div>
      </div>`).join('');
  } else {
    list.innerHTML = `<div style="color:var(--muted);padding:14px 0">
      Live audit feed loads from chain events after connecting.</div>`;
  }
}

function renderStats(){
  if (isDemo){
    document.getElementById('s-treasury').textContent = fmt(demoState.treasury, 4) + ' ETH';
    document.getElementById('s-count').textContent    = demoState.employees.length;
    const total = demoState.employees.reduce((s,e)=>s+parseFloat(e.salary),0);
    document.getElementById('s-payroll').textContent  = '$' + fmt(total);
    document.getElementById('s-next').textContent     = '31 Oct, 23:59';
  } else {
    document.getElementById('s-count').textContent    = liveEmployees.length;
    const total = liveEmployees.reduce((s,e)=>s+parseFloat(e.salary),0);
    document.getElementById('s-payroll').textContent  = fmt(total) + ' ETH';
  }
}

// ---------- Live loader ----------
async function loadLiveEmployees(){
  if (!isReady()) return;
  const count = await gozzyContract.methods.getEmployeeCount().call();
  liveEmployees = [];
  for (let i = 0; i < count; i++){
    const w = await gozzyContract.methods.getEmployeeAt(i).call();
    const e = await gozzyContract.methods.getEmployee(w).call();
    liveEmployees.push({
      wallet: w, name: e[0], role: e[1], country: e[2], currency: e[3],
      salary: gozzyWeb3.utils.fromWei(e[4],'ether'),
      tax: Number(e[5]), lastPaidAt: Number(e[6]),
      totalGross: e[7], totalNet: e[8], totalTax: e[9],
      active: e[10], auto: e[11]
    });
  }
  const bal = await gozzyWeb3.eth.getBalance(GOZZY_CONFIG.contract);
  document.getElementById('s-treasury').textContent = gozzyWeb3.utils.fromWei(bal,'ether') + ' ETH';
  document.getElementById('s-next').textContent     = '01 Nov, 00:00';
  renderEmployees(); renderStats();
}

// ---------- Connect ----------
async function connectWallet(){
  if (isDemo){
    try{
      await GozzyDemo.connect({ role: 'admin' });
      demoState.connected = true;
      demoState.address   = GozzyDemo.getAddress();
      document.getElementById('walletLabel').textContent = shortAddr(demoState.address);
      log('✅ Wallet connected — ' + shortAddr(demoState.address), 'ok');
      renderEmployees(); renderStats(); renderAudit();
    } catch(e){
      log('❌ ' + e.message, 'error');
    }
    return;
  }

  // Live mode unchanged
  try{
    await gozzyConnect();
    document.getElementById('walletLabel').textContent = shortAddr(gozzyAccount);
    log('✅ Connected: ' + shortAddr(gozzyAccount), 'ok');
    await loadLiveEmployees();
  } catch(e){
    log('❌ ' + e.message, 'error');
  }
}

function ensureLive(){
  if (isDemo) {
    if (!demoState.connected){ log('Connect wallet first', 'error'); return false; }
    return true;
  }
  if (!isReady()){ log('Connect wallet first', 'error'); return false; }
  return true;
}

// ---------- Actions ----------
async function addEmployee(){
  const name     = document.getElementById('empName').value.trim();
  const role     = document.getElementById('empRole').value.trim();
  const country  = document.getElementById('empCountry').value;
  const currency = document.getElementById('empCurrency').value;
  const salary   = document.getElementById('empSalary').value.trim();
  const taxPct   = parseFloat(document.getElementById('empTax').value || '0');
  const wallet   = document.getElementById('empWallet').value.trim();

  if (!name || !wallet || !salary) return log('Fill name, wallet and salary', 'error');
  if (taxPct < 0 || taxPct > 50)   return log('Tax must be 0–50%', 'error');
  const taxBps = Math.round(taxPct * 100);

  if (isDemo){
    if (!ensureLive()) return;

    // Realistic: simulate an on-chain "addEmployee" tx
    try{
      const fakeWallet = wallet.startsWith("0x") && wallet.length === 42
        ? wallet
        : "0x" + Math.random().toString(16).slice(2).padEnd(40,'0').slice(0,40);

      await GozzyDemo.simulateTx({
        title: "Add employee to payroll",
        subtitle: name + " · " + role,
        amount: 0.00042,
        currency: "ETH",
        gasEth: "0.00042"
      });

      demoState.employees.push({
        wallet: fakeWallet, name, role, country, currency,
        salary, tax: taxBps, auto: true, active: true,
        lastPaid: "—", totalGross: 0, totalNet: 0, totalTax: 0, ytdNet: 0
      });
      log(`✅ ${name} added to payroll (tx confirmed)`, 'ok');
      renderEmployees(); renderStats();
      ['empName','empRole','empSalary','empWallet'].forEach(id => document.getElementById(id).value = '');
    } catch(e){
      log('❌ ' + e.message, 'error');
    }
