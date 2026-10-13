// ============================================================
// Gozzy Payroll — Demo Simulation Engine
// Creates a fake MetaMask-like wallet experience for client demos.
// Live mode ignores this file entirely.
// ============================================================

const GozzyDemo = (() => {

  // ---------- state ----------
  const state = {
    connected: false,
    address: null,
    chainId: 11155111,
    chainName: "Sepolia",
    balances: {},           // per-wallet fake balances
    listeners: [],
  };

  // ---------- helpers ----------
  const randHex = n => Array.from({length:n}, () => "0123456789abcdef"[Math.floor(Math.random()*16)]).join("");
  const delay  = ms => new Promise(r => setTimeout(r, ms));
  const fmt = (n, d=2) => Number(n).toLocaleString(undefined,{minimumFractionDigits:d, maximumFractionDigits:d});
  const short = a => a ? a.slice(0,6)+'...'+a.slice(-4) : '';

  function emit(evt, payload){ state.listeners.forEach(l => l(evt, payload)); }
  function on(fn){ state.listeners.push(fn); }

  // ---------- fake network latency ----------
  const latency = (min=300, max=900) => delay(min + Math.random()*(max-min));

  // ---------- wallet connection flow ----------
  async function connect({ role = "admin", walletId = "metamask" } = {}) {
    // 1. show the fake "MetaMask is opening" overlay
    showOverlay("Opening " + prettyWallet(walletId) + "...");
    await delay(700);
    hideOverlay();

    // 2. show the fake approval modal
    const approved = await showApprovalModal(walletId, role);
    if (!approved) {
      throw new Error("User rejected the request.");
    }

    // 3. simulate chain switch / signature
    showOverlay("Waiting for signature...");
    await delay(1200);
    hideOverlay();

    // 4. "broadcasting" — gives the feel of a network roundtrip
    showOverlay("Verifying signature...");
    await latency(600, 1000);
    hideOverlay();

    // 5. set state
    state.connected = true;
    state.address   = role === "admin"
      ? GOZZY_DEMO.adminWallet
      : GOZZY_DEMO.employees[Math.floor(Math.random()*GOZZY_DEMO.employees.length)].wallet;

    state.balances[state.address] = state.balances[state.address] ?? +(0.4 + Math.random()*2.3).toFixed(4);

    emit("connected", { address: state.address, chain: state.chainName });
    return state.address;
  }

  function disconnect(){
    state.connected = false;
    state.address   = null;
    emit("disconnected", {});
  }

  function prettyWallet(id){
    return (GOZZY_DEMO.wallets.find(w => w.id === id) || {}).name || "Wallet";
  }

  // ---------- fake tx flow ----------
  /**
   * Simulates a full on-chain transaction:
   *  1. wallet popup asking to confirm
   *  2. waiting for user approval (auto-approves after delay)
   *  3. submitted to mempool
   *  4. confirmations (1/3 → 2/3 → 3/3)
   *  5. success
   */
  async function simulateTx({ title, subtitle, amount, currency="ETH", gasEth="0.00042" }) {
    // Step 1: confirm modal
    const ok = await showConfirmModal({ title, subtitle, amount, currency, gasEth });
    if (!ok) throw new Error("User rejected the transaction.");

    // Step 2: mempool
    showOverlay("Broadcasting transaction...");
    await latency(700, 1200);

    // Step 3: confirmations
    for (let i = 1; i <= 3; i++){
      showOverlay(`Waiting for confirmations (${i}/3)...`);
      await delay(900);
    }
    hideOverlay();

    // Step 4: mutate fake state
    const txHash = "0x" + randHex(64);
    emit("tx", { hash: txHash, title, amount, currency });

    return { hash: txHash, status: "confirmed" };
  }

  function getAddress(){ return state.address; }
  function isConnected(){ return state.connected; }
  function getBalance(wallet){
    return state.balances[wallet] ?? 0;
  }

  // ------------------------------------------------------------
  // UI overlays (injected on demand — no HTML changes needed)
  // ------------------------------------------------------------
  function ensureStyles(){
    if (document.getElementById("gozzy-demo-styles")) return;
    const s = document.createElement("style");
    s.id = "gozzy-demo-styles";
    s.textContent = `
      .gz-overlay{position:fixed;inset:0;background:rgba(5,5,15,.72);backdrop-filter:blur(6px);
        display:flex;align-items:center;justify-content:center;z-index:9000;opacity:0;
        transition:opacity .18s ease}
      .gz-overlay.show{opacity:1}
      .gz-box{background:#0e0e1e;border:1px solid rgba(255,255,255,.09);border-radius:20px;
        padding:28px;max-width:440px;width:92%;box-shadow:0 30px 80px rgba(0,0,0,.6)}
      .gz-title{font-weight:800;font-size:1.1rem;margin:0 0 6px;color:#fff}
      .gz-sub{color:#8f8fa8;font-size:.88rem;margin:0 0 20px}
      .gz-spin{width:44px;height:44px;border-radius:50%;border:3px solid rgba(255,210,0,.15);
        border-top-color:#ffd200;margin:0 auto 16px;animation:gzspin .8s linear infinite}
      @keyframes gzspin{to{transform:rotate(360deg)}}
      .gz-wallet-opt{display:flex;align-items:center;gap:12px;padding:14px;border-radius:14px;
        border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.02);
        cursor:pointer;margin-bottom:10px;transition:all .18s}
      .gz-wallet-opt:hover{border-color:rgba(255,210,0,.4);background:rgba(255,210,0,.04)}
      .gz-wallet-opt .ico{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;
        justify-content:center;font-size:20px;background:rgba(255,255,255,.05)}
      .gz-wallet-opt .nm{font-weight:600}
      .gz-wallet-opt .tag{margin-left:auto;font-size:.7rem;color:#ffd200;
        background:rgba(255,210,0,.12);padding:3px 9px;border-radius:999px;font-weight:700}
      .gz-btns{display:flex;gap:10px;margin-top:20px}
      .gz-btn{flex:1;padding:12px;border-radius:999px;border:0;font-weight:700;cursor:pointer;
        font-size:.9rem;transition:all .2s}
      .gz-btn.primary{background:linear-gradient(135deg,#f7971e,#ffd200);color:#0b0b18}
      .gz-btn.primary:hover{transform:translateY(-1px);box-shadow:0 10px 30px rgba(255,210,0,.35)}
      .gz-btn.ghost{background:transparent;border:1px solid rgba(255,255,255,.15);color:#eaeaf5}
      .gz-btn.ghost:hover{border-color:#ffd200;color:#ffd200}
      .gz-detail{display:flex;justify-content:space-between;padding:9px 0;
        border-bottom:1px solid rgba(255,255,255,.05);font-size:.85rem}
      .gz-detail:last-of-type{border:0}
      .gz-detail .k{color:#8f8fa8}
      .gz-detail .v{font-weight:600;font-family:ui-monospace,monospace}
      .gz-mono{font-family:ui-monospace,Menlo,monospace;font-size:.78rem;color:#8f8fa8}
      .gz-amount{font-size:2rem;font-weight:800;color:#ffd200;text-align:center;margin:6px 0 18px}
    `;
    document.head.appendChild(s);
  }

  function makeOverlay(html){
    ensureStyles();
    const el = document.createElement("div");
    el.className = "gz-overlay";
    el.innerHTML = `<div class="gz-box">${html}</div>`;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add("show"));
    return el;
  }

  function showOverlay(message){
    hideOverlay();
    const el = makeOverlay(`<div class="gz-spin"></div>
      <div class="gz-title" style="text-align:center">${message}</div>`);
    el.dataset.overlay = "1";
  }
  function hideOverlay(){
    document.querySelectorAll('.gz-overlay[data-overlay="1"]').forEach(el => {
      el.classList.remove("show");
      setTimeout(()=>el.remove(), 200);
    });
  }

  async function showApprovalModal(walletId, role){
    const w = GOZZY_DEMO.wallets.find(x => x.id === walletId) || GOZZY_DEMO.wallets[0];
    const el = makeOverlay(`
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:22px">
        <div style="width:40px;height:40px;border-radius:10px;background:${w.color};
             display:flex;align-items:center;justify-content:center;font-size:22px">${w.icon}</div>
        <div>
          <div class="gz-title" style="margin:0">${w.name}</div>
          <div class="gz-sub" style="margin:0">Connection request</div>
        </div>
      </div>
      <div style="background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);
           border-radius:14px;padding:16px;margin-bottom:8px">
        <div class="gz-detail"><span class="k">Site</span><span class="v">gozzy-payroll.onrender.com</span></div>
        <div class="gz-detail"><span class="k">Requested</span><span class="v">View wallet · Request signature</span></div>
        <div class="gz-detail"><span class="k">Role</span><span class="v">${role === 'admin' ? 'Payroll Admin' : 'Employee'}</span></div>
        <div class="gz-detail"><span class="k">Network</span><span class="v">Sepolia Testnet</span></div>
      </div>
      <div class="gz-btns">
        <button class="gz-btn ghost" data-act="cancel">Reject</button>
        <button class="gz-btn primary" data-act="ok">Connect</button>
      </div>`);
    return new Promise(resolve => {
      el.addEventListener("click", e => {
        const act = e.target.dataset.act;
        if (!act) return;
        el.classList.remove("show");
        setTimeout(()=>el.remove(), 200);
        resolve(act === "ok");
      });
    });
  }

  async function showConfirmModal({ title, subtitle, amount, currency, gasEth }){
    const el = makeOverlay(`
      <div class="gz-title">${title}</div>
      <div class="gz-sub">${subtitle || 'Review and confirm'}</div>
      <div class="gz-amount">${fmt(amount)} <span style="font-size:1rem;color:#8f8fa8">${currency}</span></div>
      <div style="background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);
           border-radius:14px;padding:14px">
        <div class="gz-detail"><span class="k">Network fee</span><span class="v">${gasEth} ETH</span></div>
        <div class="gz-detail"><span class="k">Speed</span><span class="v">Standard · ~30s</span></div>
        <div class="gz-detail"><span class="k">Total</span><span class="v">${fmt(amount)} ${currency} + gas</span></div>
      </div>
      <div class="gz-btns">
        <button class="gz-btn ghost" data-act="cancel">Reject</button>
        <button class="gz-btn primary" data-act="ok">Confirm</button>
      </div>`);
    return new Promise(resolve => {
      el.addEventListener("click", e => {
        const act = e.target.dataset.act;
        if (!act) return;
        el.classList.remove("show");
        setTimeout(()=>el.remove(), 200);
        resolve(act === "ok");
      });
    });
  }

  return { connect, disconnect, simulateTx, getAddress, isConnected, getBalance, on, short, fmt };
})();

// expose globally
window.GozzyDemo = GozzyDemo;
