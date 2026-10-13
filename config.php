<?php
// ------------------------------------------------------------
// Gozzy Group — Payroll Portal
// Database-free edition (Render-safe, no SQL anywhere)
// ------------------------------------------------------------
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 0); // set to 1 for debugging only

// --------- Blockchain config ---------
// Replace with your deployed contract on Sepolia
define('GOZZY_CONTRACT',     '0xYourDeployedContractAddress');
define('GOZZY_CHAIN_ID',     '11155111');           // Sepolia
define('GOZZY_NETWORK_NAME', 'Sepolia Testnet');
define('GOZZY_RPC',          'https://rpc.sepolia.org');

// Company branding (edit freely)
define('GOZZY_COMPANY',   'Gozzy Group Holdings');
define('GOZZY_TAGLINE',   'Global payroll. Settled on-chain.');
define('GOZZY_YEAR',      date('Y'));

// ------------------------------------------------------------
// Contract ABI — paste the JSON array from Remix here.
// Keep it as a PHP array and we'll json_encode it in the pages.
// ------------------------------------------------------------
$GOZZY_ABI_ARRAY = [
    // ==== Auto-generated ABI from your deployed contract ====
    // Paste the array contents from Remix "ABI" button below.
    // Example entry (replace with your full ABI):
    // [
    //   "inputs":[{"internalType":"address","name":"_wallet","type":"address"}],
    //   "name":"paySalary","outputs":[],"stateMutability":"nonpayable","type":"function"
    // ],
];

// Encode for the frontend
$GOZZY_ABI = json_encode($GOZZY_ABI_ARRAY);

// ------------------------------------------------------------
// Helper: is this a demo request? (?demo=1)
// ------------------------------------------------------------
function gozzy_is_demo(): bool {
    return isset($_GET['demo']) && $_GET['demo'] === '1';
}
