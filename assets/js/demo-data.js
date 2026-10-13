// ============================================================
// Gozzy Payroll — Realistic Demo Dataset
// ============================================================
window.GOZZY_DEMO = {
  company: {
    name:     "Gozzy Group Holdings",
    treasury: 1284.75,      // ETH
    treasuryUSD: 4_215_340, // pretend ETH ≈ $3,280
    payroll:  42350,        // USD equivalent monthly
    taxHeld:  11782.50,     // USD
    employees: 8,
    nextRun:  "31 Oct 2026, 23:59 UTC",
  },

  // Wallet options shown in the fake MetaMask picker
  wallets: [
    { id:"metamask", name:"MetaMask",        color:"#f6851b", icon:"🦊", recommended:true },
    { id:"coinbase", name:"Coinbase Wallet", color:"#0052ff", icon:"🔵", recommended:false },
    { id:"walletconnect", name:"WalletConnect", color:"#3b99fc", icon:"🌐", recommended:false },
    { id:"trust",    name:"Trust Wallet",    color:"#3375bb", icon:"🛡", recommended:false },
  ],

  // The connected admin wallet for demo
  adminWallet: "0x7Ae9c1F4bE82d5cA2eF31b9C6d0A4E8f2B1C3D5A",

  employees: [
    { wallet:"0xA1b2C3d4E5f6789012345678901234567890abcd", name:"Amara Okafor",  role:"Head of Engineering", country:"NG", currency:"USD", salary:"4500", tax:750,  auto:true,  active:true,  start:"2024-03-04", bank:"GTBank •••• 4471" },
    { wallet:"0xB2c3D4e5F6789012345678901234567890abcdef", name:"Liam O'Connor", role:"Product Designer",    country:"IE", currency:"EUR", salary:"3800", tax:2000, auto:true,  active:true,  start:"2024-06-12", bank:"AIB •••• 8820" },
    { wallet:"0xC3d4E5f6789012345678901234567890abcdef01", name:"Sofia Rossi",   role:"Finance Lead",        country:"IT", currency:"EUR", salary:"5200", tax:2500, auto:true,  active:true,  start:"2023-11-01", bank:"UniCredit •••• 1209" },
    { wallet:"0xD4e5F6789012345678901234567890abcdef0123", name:"Kenji Tanaka",  role:"Backend Engineer",    country:"JP", currency:"USD", salary:"4000", tax:1000, auto:false, active:true,  start:"2024-01-08", bank:"MUFG •••• 5501" },
    { wallet:"0xE5f6789012345678901234567890abcdef012345", name:"Priya Sharma",  role:"Growth Lead",         country:"IN", currency:"USD", salary:"3200", tax:500,  auto:true,  active:true,  start:"2024-09-02", bank:"HDFC •••• 3390" },
    { wallet:"0xF6789012345678901234567890abcdef01234567", name:"Marcus Weber",  role:"Compliance Officer",  country:"DE", currency:"EUR", salary:"6000", tax:3000, auto:true,  active:true,  start:"2023-05-20", bank:"Deutsche Bank •••• 7742" },
    { wallet:"0x0789012345678901234567890abcdef012345678", name:"Zara Ahmed",    role:"Customer Success",    country:"AE", currency:"USD", salary:"2800", tax:0,    auto:false, active:true,  start:"2025-02-15", bank:"Emirates NBD •••• 9910" },
    { wallet:"0x189012345678901234567890abcdef0123456789", name:"Diego Alvarez", role:"Sales Director",      country:"MX", currency:"USD", salary:"5500", tax:1500, auto:true,  active:true,  start:"2023-08-30", bank:"BBVA •••• 2264" },
  ],

  // -------- Per-employee transaction history --------
  transactions: {
    "0xA1b2C3d4E5f6789012345678901234567890abcd": [
      { t:"2026-09-30 23:59", kind:"Salary",  gross:4500, tax:337.50, net:4162.50, tx:"0x8a2f11...c91b", status:"confirmed" },
      { t:"2026-08-31 23:59", kind:"Salary",  gross:4500, tax:337.50, net:4162.50, tx:"0x7c1e02...4499", status:"confirmed" },
      { t:"2026-07-31 23:59", kind:"Salary",  gross:4500, tax:337.50, net:4162.50, tx:"0x6d0f89...8821", status:"confirmed" },
      { t:"2026-07-15 10:22", kind:"Bonus",   gross:1000, tax:75.00,  net:925.00,  tx:"0x5b8a71...1a03", status:"confirmed" },
      { t:"2026-06-30 23:59", kind:"Salary",  gross:4500, tax:337.50, net:4162.50, tx:"0x4a9c62...ff42", status:"confirmed" },
    ],
    // ... (I'll add a helper so any employee without history gets auto-generated)
  },

  // Audit trail (admin view)
  audit: [
    { t:"2026-09-30 23:59", kind:"auto",   who:"Amara Okafor",  amt:4162.50, cur:"USD", tx:"0x8a2f...c91b", country:"NG" },
    { t:"2026-09-30 23:59", kind:"auto",   who:"Liam O'Connor", amt:3040.00, cur:"EUR", tx:"0x1b3d...77aa", country:"IE" },
    { t:"2026-09-30 23:59", kind:"auto",   who:"Sofia Rossi",   amt:3900.00, cur:"EUR", tx:"0x9f10...de22", country:"IT" },
    { t:"2026-09-30 23:59", kind:"auto",   who:"Priya Sharma",  amt:3040.00, cur:"USD", tx:"0xc443...21f0", country:"IN" },
    { t:"2026-09-30 23:59", kind:"auto",   who:"Marcus Weber",  amt:4200.00, cur:"EUR", tx:"0x7721...a3b1", country:"DE" },
    { t:"2026-09-30 23:59", kind:"auto",   who:"Diego Alvarez", amt:4675.00, cur:"USD", tx:"0x6611...9988", country:"MX" },
    { t:"2026-09-28 14:22", kind:"bonus",  who:"Kenji Tanaka",  amt:1000.00, cur:"USD", tx:"0xaa21...4488", country:"JP" },
    { t:"2026-09-27 09:15", kind:"manual", who:"Priya Sharma",  amt:3040.00, cur:"USD", tx:"0xdd44...90aa", country:"IN" },
    { t:"2026-09-25 11:03", kind:"bonus",  who:"Sofia Rossi",   amt:2500.00, cur:"EUR", tx:"0x4411...22ff", country:"IT" },
    { t:"2026-08-31 23:59", kind:"auto",   who:"Amara Okafor",  amt:4162.50, cur:"USD", tx:"0x3344...11bb", country:"NG" },
    { t:"2026-08-31 23:59", kind:"auto",   who:"Marcus Weber",  amt:4200.00, cur:"EUR", tx:"0x2233...99cc", country:"DE" },
  ],

  // Helper: generate fake tx history if missing
  historyFor(wallet) {
    if (this.transactions[wallet]) return this.transactions[wallet];
    const emp = this.employees.find(e => e.wallet === wallet);
    if (!emp) return [];
    const gross = parseFloat(emp.salary);
    const taxRate = emp.tax / 10000;
    const net = +(gross * (1 - taxRate)).toFixed(2);
    const tax = +(gross * taxRate).toFixed(2);
    const months = ["Sep 2026","Aug 2026","Jul 2026","Jun 2026","May 2026","Apr 2026"];
    return months.map((m,i) => ({
      t: `2026-${String(9-i).padStart(2,'0')}-30 23:59`,
      kind: "Salary",
      gross, tax, net,
      tx: "0x" + Math.random().toString(16).slice(2,10) + "..." + Math.random().toString(16).slice(2,6),
      status: "confirmed"
    }));
  }
};
