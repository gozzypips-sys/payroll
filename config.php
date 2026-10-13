<?php
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

// === DB (MySQL) ===
define('DB_HOST', 'localhost');
define('DB_NAME', 'gozzy_payroll');
define('DB_USER', 'root');
define('DB_PASS', '');

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    die("DB error: " . $e->getMessage());
}

// === Blockchain config ===
define('GOZZY_CONTRACT', '0xYourDeployedContractAddressHere');
define('GOZZY_CHAIN_ID', '11155111');           // Sepolia
define('GOZZY_NETWORK_NAME', 'Sepolia Testnet');
define('GOZZY_RPC', 'https://rpc.sepolia.org');

// ABI — paste the JSON ABI from Remix here (compressed array is fine)
$GOZZY_ABI = json_encode([
  // ... paste ABI array here ...
]);