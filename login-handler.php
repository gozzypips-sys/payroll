<?php
require 'config.php';
header('Content-Type: application/json');
$input = json_decode(file_get_contents('php://input'), true);
$wallet = strtolower($input['wallet'] ?? '');
$role   = $input['role'] ?? 'employee';

if(!$wallet){ echo json_encode(['success'=>false,'message'=>'No wallet']); exit; }

if($role === 'admin'){
    $stmt = $pdo->prepare("SELECT * FROM admins WHERE LOWER(wallet)=?");
    $stmt->execute([$wallet]);
    $a = $stmt->fetch(PDO::FETCH_ASSOC);
    if(!$a){ echo json_encode(['success'=>false,'message'=>'Not a Gozzy admin wallet']); exit; }
    $_SESSION['admin_wallet'] = $wallet;
    $_SESSION['admin_name']   = $a['name'];
    echo json_encode(['success'=>true,'name'=>$a['name'],'redirect'=>'dashboard.php']);
} else {
    $stmt = $pdo->prepare("SELECT * FROM employees WHERE LOWER(wallet)=?");
    $stmt->execute([$wallet]);
    $e = $stmt->fetch(PDO::FETCH_ASSOC);
    if(!$e){ echo json_encode(['success'=>false,'message'=>'Wallet not registered as employee']); exit; }
    $_SESSION['emp_wallet'] = $wallet;
    $_SESSION['emp_name']   = $e['name'];
    $_SESSION['emp_id']     = $e['id'];
    echo json_encode(['success'=>true,'name'=>$e['name'],'redirect'=>'employee.php']);
}