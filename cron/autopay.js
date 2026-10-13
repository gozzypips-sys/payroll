const Web3 = require('web3');
const web3 = new Web3('https://rpc.sepolia.org');

const ABI = [ /* paste runAutoPayroll ABI */ ];
const CONTRACT = '0xYourContract';
const ADMIN_KEY = '0xYourAdminPrivateKey'; // store in .env, NOT in code

(async () => {
  const contract = new web3.eth.Contract(ABI, CONTRACT);
  const acct = web3.eth.accounts.privateKeyToAccount(ADMIN_KEY);
  web3.eth.accounts.wallet.add(acct);

  const tx = contract.methods.runAutoPayroll();
  const gas = await tx.estimateGas({from: acct.address});
  const data = tx.encodeABI();
  const signed = await web3.eth.accounts.signTransaction(
    {to: CONTRACT, data, gas, gasPrice: await web3.eth.getGasPrice()},
    ADMIN_KEY
  );
  const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);
  console.log('Auto-payroll done:', receipt.transactionHash);
})();