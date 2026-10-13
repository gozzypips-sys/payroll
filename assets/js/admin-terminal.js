// ============================================================
// Admin Terminal logic (demo + live)
// ============================================================
const isDemo = window.GOZZY_DEMO_MODE === true;
let liveEmployees = [];   // populated on-chain in live mode

// ---------- UI helpers ----------
function log(msg, cls=''){
  const el = document.getElementById('log');
  el.style.display = 'block';
  const color = cls==='error' ? 'var(--red)' : cls==='ok' ? 'var(--green)' : 'var(--muted)';
  el.innerHTML = `<span style="color:${color}">${msg}</span>`;
  clearTimeout(window.__logT);
  window.__logT = setTimeout(()=> el.style.display='none', 6000);
}

function badge(text, cls){ return `<span class="badge ${cls}">${text}</span>`; }

function renderEmployees(){
  const tb = document.getElementById('empTbody');
  const q  = (document.getElementById('search').value || '').toLowerCase();
  const rows = isDemo ? GOZZY_DEMO.employees : liveEmployees;

  const filtered = rows.filter(r =>
    !q || (r.name + r.role + r.wallet + r.country).toLowerCase().includes(q));

  if (!filtered.length){
    tb.innerHTML = `<tr><td colspan="10" style="text-align:center;color:var(--muted);padding:30px">
      ${isDemo ? 'No matches.' : 'Connect wallet to load employees.'}
    </td></tr>`;
    return;
  }

  tb.innerHTML = filtered.map(e => {
    const gross = parseFloat(e.salary);
    const taxPct = isDemo ? (e.tax/100).toFixed(2) : (e.tax/100).toFixed(2);
    const net = (gross * (1 - (e.tax/10000))).toFixed(2);
    return `
    <tr>
      <td style="font-weight:600">${e.name}</td>
      <td style="color:var(--muted)">${e.role}</td>
      <td>${badge(e.country,'blue')}</td>
      <td style="font-family:monospace;font-size:.78rem">${shortAddr(e.wallet)}</td>
      <td>${e.currency} ${gross.toLocaleString()}</td>
      <td style="color:var(--muted)">${taxPct}%</td>
      <td style="color:var(--green);font-weight:600">${e.currency} ${Number(net).toLocaleString()}</td>
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
        </div>
        <div style="text-align:right">
          <b style="color:var(--green)">${a.cur} ${a.amt}</b>
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
    document.getElementById('s-treasury').textContent = GOZZY_DEMO.treasury + ' ETH';
    document.getElementById('s-count').textContent    = GOZZY_DEMO.employees.length;
    const total = GOZZY_DEMO.employees.reduce((s,e)=>s+parseFloat(e.salary),0);
    document.getElementById('s-payroll').textContent  = '$' + total.toLocaleString();
    document.getElementById('s-next').textContent     = '31 Oct, 23:59';
  } else {
    document.getElementById('s-count').textContent    = liveEmployees.length;
    const total = liveEmployees.reduce((s,e)=>s+parseFloat(e.salary),0);
    document.getElementById('s-payroll').textContent  = total.toFixed(2) + ' ETH';
  }
}

// ---------- Live data loader ----------
async function loadLiveEmployees(){
  if (!isReady()) return;
  const count = await gozzyContract.methods.getEmployeeCount().call();
  liveEmployees = [];
  for (let i = 0; i < count; i++){
    const w = await gozzyContract.methods.getEmployeeAt(i).call();
    const e = await gozzyContract.methods.getEmployee(w).call();
    liveEmployees.push({
      wallet: w,
      name: e[0], role: e[1], country: e[2], currency: e[3],
      salary: gozzyWeb3.utils.fromWei(e[4],'ether'),
      tax: Number(e[5]),
      lastPaidAt: Number(e[6]),
      totalGross: e[7], totalNet: e[8], totalTax: e[9],
      active: e[10], auto: e[11]
    });
  }
  const bal = await gozzyWeb3.eth.getBalance(GOZZY_CONFIG.contract);
  document.getElementById('s-treasury').textContent = gozzyWeb3.utils.fromWei(bal,'ether') + ' ETH';
  document.getElementById('s-next').textContent     = '01 Nov, 00:00';
  renderEmployees();
  renderStats();
}

// ---------- Actions ----------
async function connectWallet(){
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
  if (isDemo) return true;
  if (!isReady()){ log('Connect wallet first', 'error'); return false; }
  return true;
}

async function addEmployee(){
  const name     = document.getElementById('empName').value.trim();
  const role     = document.getElementById('empRole').value.trim();
  const country  = document.getElementById('empCountry').value;
  const currency = document.getElementById('empCurrency').value;
  const salary   = document.getElementById('empSalary').value.trim();
  const taxPct   = parseFloat(document.getElementById('empTax').value || '0');
  const wallet   = document.getElementById('empWallet').value.trim();

  if (!name || !wallet || !salary) return log('Fill name, wallet and salary', 'error');
  if (taxPct < 0 || taxPct > 50) return log('Tax must be 0–50%', 'error');

  const taxBps = Math.round(taxPct * 100);

  // DEMO MODE
  if (isDemo){
    if (GOZZY_DEMO.employees.some(e => e.wallet.toLowerCase() === wallet.toLowerCase()))
      return log('Employee already exists', 'error');
    GOZZY_DEMO.employees.push({
      wallet, name, role, country, currency,
      salary, tax: taxBps, lastPaid: new Date().toISOString().slice(0,10),
      totalGross: '0', totalNet: '0', totalTax: '0', auto: true, active: true
    });
    log(`✅ ${name} added to demo payroll`, 'ok');
    renderEmployees(); renderStats();
    ['empName','empRole','empSalary','empWallet'].forEach(id => document.getElementById(id).value = '');
    return;
  }

  // LIVE MODE
  if (!ensureLive()) return;
  if (!gozzyWeb3.utils.isAddress(wallet)) return log('Invalid wallet address', 'error');
  if (isNaN(parseFloat(salary))) return log('Salary must be a number', 'error');

  try{
    log('Confirm in MetaMask...');
    await gozzyAddEmployee(wallet, name, role, country, currency, salary, taxBps);
    await fetch('api/save-employee.php', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ name, role, country, currency, wallet, salary, tax_bps: taxBps })
    });
    log('✅ ' + name + ' added on-chain', 'ok');
    ['empName','empRole','empSalary','empWallet'].forEach(id => document.getElementById(id).value='');
    await loadLiveEmployees();
  } catch(e){
    log('❌ ' + e.message, 'error');
  }
}

async function payOne(wallet, name){
  if (isDemo){ log(`💸 Paid ${name} (demo)`, 'ok'); return; }
  if (!ensureLive()) return;
  try{ log(`Paying ${name}...`); await gozzyPaySalary(wallet); log('✅ Paid', 'ok'); await loadLiveEmployees(); }
  catch(e){ log('❌ ' + e.message, 'error'); }
}

async function payBonus(wallet, name){
  const amt = prompt(`Bonus for ${name} (ETH):`);
  if (!amt) return;
  if (isDemo){ log(`🎁 Bonus ${amt} ETH to ${name} (demo)`, 'ok'); return; }
  if (!ensureLive()) return;
  try{ await gozzyPayBonus(wallet, amt); log('✅ Bonus paid', 'ok'); await loadLiveEmployees(); }
  catch(e){ log('❌ ' + e.message, 'error'); }
}

async function payAll(){
  if (isDemo){ log('⚡ Batch pay executed (demo)', 'ok'); return; }
  if (!ensureLive()) return;
  try{ await gozzyPayAll(); log('✅ Batch payment done', 'ok'); await loadLiveEmployees(); }
  catch(e){ log('❌ ' + e.message, 'error'); }
}

async function runAuto(){
  if (isDemo){ log('🤖 Auto-payroll executed (demo)', 'ok'); return; }
  if (!ensureLive()) return;
  try{ await gozzyRunAuto(); log('✅ Auto-payroll done', 'ok'); await loadLiveEmployees(); }
  catch(e){ log('❌ ' + e.message, 'error'); }
}

async function depositFunds(){
  const amt = document.getElementById('depositAmt').value.trim();
  if (!amt) return log('Enter ETH amount', 'error');
  if (isDemo){ log(`🏦 Treasury funded with ${amt} ETH (demo)`, 'ok'); document.getElementById('depositAmt').value=''; return; }
  if (!ensureLive()) return;
  try{ await gozzyDeposit(amt); log('✅ Treasury funded', 'ok'); document.getElementById('depositAmt').value=''; await loadLiveEmployees(); }
  catch(e){ log('❌ ' + e.message, 'error'); }
}

// ---------- Boot ----------
document.addEventListener('DOMContentLoaded', () => {
  renderEmployees(); renderStats(); renderAudit();
  if (!isDemo && typeof window.ethereum !== 'undefined'){
    window.ethereum.request({ method:'eth_accounts' }).then(a => {
      if (a?.length) connectWallet();
    }).catch(()=>{});
  }
});