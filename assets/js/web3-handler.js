// ============================================================
// Gozzy Payroll — Web3 handler (hardened)
// ============================================================
let gozzyWeb3 = null, gozzyAccount = null, gozzyContract = null;

const GOZZY_CONFIG = {
  contract:    window.GOZZY_CONTRACT_ADDRESS,
  abi:         window.GOZZY_ABI,
  chainId:     window.GOZZY_CHAIN_ID,
  networkName: window.GOZZY_NETWORK_NAME
};

function shortAddr(a){ return a ? a.slice(0,6)+'...'+a.slice(-4) : ''; }
function isReady(){ return !!(gozzyWeb3 && gozzyAccount && gozzyContract); }
function requireReady(){
  if (!isReady()) throw new Error('Wallet not connected. Connect first.');
}

async function gozzyConnect(){
  if (typeof window.ethereum === 'undefined') throw new Error('MetaMask not installed.');
  let provider = window.ethereum;
  if (window.ethereum.providers?.length) {
    provider = window.ethereum.providers.find(p => p.isMetaMask) || window.ethereum.providers[0];
  }
  const accounts = await provider.request({ method:'eth_requestAccounts' });
  if (!accounts?.length) throw new Error('No account returned.');
  gozzyAccount = accounts[0];
  gozzyWeb3 = new Web3(provider);

  const chainId = await gozzyWeb3.eth.getChainId();
  if (String(chainId) !== String(GOZZY_CONFIG.chainId)) {
    try {
      await provider.request({
        method:'wallet_switchEthereumChain',
        params:[{ chainId: '0x' + Number(GOZZY_CONFIG.chainId).toString(16) }]
      });
    } catch { throw new Error('Switch to ' + GOZZY_CONFIG.networkName); }
  }

  if (!GOZZY_CONFIG.abi?.length) throw new Error('ABI missing in config.php');
  gozzyContract = new gozzyWeb3.eth.Contract(GOZZY_CONFIG.abi, GOZZY_CONFIG.contract);

  if (provider.on) {
    provider.on('accountsChanged', () => location.reload());
    provider.on('chainChanged',    () => location.reload());
  }
  return gozzyAccount;
}

async function gozzyAddEmployee(wallet,name,role,country,currency,salary,taxBps){
  requireReady();
  if (!gozzyWeb3.utils.isAddress(wallet)) throw new Error('Invalid address');
  const wei = gozzyWeb3.utils.toWei(String(salary),'ether');
  return gozzyContract.methods
    .addEmployee(wallet,name,role,country,currency,wei,taxBps)
    .send({ from: gozzyAccount });
}
async function gozzyPaySalary(w){ requireReady(); return gozzyContract.methods.paySalary(w).send({from:gozzyAccount}); }
async function gozzyPayBonus(w,amtEth){
  requireReady();
  const wei = gozzyWeb3.utils.toWei(String(amtEth),'ether');
  return gozzyContract.methods.payBonus(w,wei).send({from:gozzyAccount});
}
async function gozzyPayAll(){ requireReady(); return gozzyContract.methods.payAllNow().send({from:gozzyAccount}); }
async function gozzyRunAuto(){ requireReady(); return gozzyContract.methods.runAutoPayroll().send({from:gozzyAccount}); }
async function gozzyToggleAuto(w,en){ requireReady(); return gozzyContract.methods.setAutoPay(w,en).send({from:gozzyAccount}); }
async function gozzyDeposit(amtEth){
  requireReady();
  const wei = gozzyWeb3.utils.toWei(String(amtEth),'ether');
  return gozzyWeb3.eth.sendTransaction({ from:gozzyAccount, to:GOZZY_CONFIG.contract, value:wei });
}

function getReadOnlyWeb3(){
  return new Web3(new Web3.providers.HttpProvider('https://rpc.sepolia.org'));
}