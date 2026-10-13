<?php
require '../config.php';
header('Content-Type: application/json');
$d = json_decode(file_get_contents('php://input'), true);
$stmt = $pdo->prepare("INSERT INTO employees (name,role,country,currency,wallet,salary,tax_bps)
  VALUES (?,?,?,?,?,?,?)
  ON DUPLICATE KEY UPDATE name=VALUES(name), role=VALUES(role), country=VALUES(country),
    currency=VALUES(currency), salary=VALUES(salary), tax_bps=VALUES(tax_bps)");
$stmt->execute([
  $d['name'], $d['role'], $d['country'], $d['currency'],
  strtolower($d['wallet']), $d['salary'], $d['tax_bps'] ?? 750
]);
echo json_encode(['ok'=>true]);