<?php
require 'config.php';
header('Content-Type: application/json');
if(!isset($_SESSION['admin_wallet'])){ echo json_encode(['ok'=>false]); exit; }

$d = json_decode(file_get_contents('php://input'), true);
$stmt = $pdo->prepare("INSERT INTO employees (name,role,wallet,salary_eth)
                       VALUES (?,?,?,?)
                       ON DUPLICATE KEY UPDATE name=VALUES(name), role=VALUES(role), salary_eth=VALUES(salary_eth)");
$stmt->execute([$d['name'],$d['role'],strtolower($d['wallet']),$d['salary']]);
echo json_encode(['ok'=>true]);