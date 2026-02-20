<?php

/**
 * seed_test_data.php
 * Script to programmatically generate test data for CyberTasker automated test suites.
 * WARNING: This script will modify the database. It is intended for testing environments.
 */

require_once __DIR__ . '/../api/db.php';
require_once __DIR__ . '/../api/repositories/UserRepository.php';
require_once __DIR__ . '/../api/repositories/TaskRepository.php';
require_once __DIR__ . '/../api/TOTP.php';

$pdo = getDBConnection();
$userRepo = new UserRepository($pdo);
$taskRepo = new TaskRepository($pdo);

echo "Starting Seed Process for CyberTasker Test Suites...\n";
echo "====================================================\n\n";

// Helper: Clear old test data
echo "Cleaning up prior test artifacts...\n";
$stmt = $pdo->query("SELECT id FROM users WHERE username LIKE 'Admin_Alpha%' OR username LIKE 'Op_Beta%' OR username LIKE 'Test_User_%'");
$usersToDelete = $stmt->fetchAll(PDO::FETCH_COLUMN);

foreach ($usersToDelete as $uId) {
    $userRepo->deleteAccount($uId);
}
echo "Purged " . count($usersToDelete) . " existing test users.\n\n";

// 1. Create Admin_Alpha
echo "1. Generating Admin_Alpha...\n";
$adminId = $userRepo->create('Admin_Alpha', 'admin_alpha@cybertasker.local', password_hash('Pass_Admin_123!!', PASSWORD_DEFAULT), bin2hex(random_bytes(32)));
$pdo->prepare("UPDATE users SET role = 'admin', is_verified = 1 WHERE id = ?")->execute([$adminId]);
echo "   [V] Admin_Alpha created (ID: $adminId)\n\n";

// 2. Create Op_Beta (With TOTP 2FA)
echo "2. Generating Op_Beta (2FA active)...\n";
$betaId = $userRepo->create('Op_Beta', 'op_beta@cybertasker.local', password_hash('Pass_Beta_123!!', PASSWORD_DEFAULT), bin2hex(random_bytes(32)));
$pdo->prepare("UPDATE users SET is_verified = 1 WHERE id = ?")->execute([$betaId]);

// Setup specific TOTP Seed for testing: 'JBSWY3DPEHPK3PXP'
$testSecret = 'JBSWY3DPEHPK3PXP';
$backupCodes = ['AAAA-BBBB', 'CCCC-DDDD', 'EEEE-FFFF', 'GGGG-HHHH', 'IIII-JJJJ'];
$hashedCodes = array_map(function ($c) {
    return password_hash($c, PASSWORD_DEFAULT);
}, $backupCodes);
$userRepo->enableTotp2fa($betaId, $testSecret, json_encode($hashedCodes));
echo "   [V] Op_Beta created (ID: $betaId, 2FA Enabled)\n";

// 2.1 Seed 55 Tasks for Op_Beta to test pagination
echo "   [+] Injecting 55 directives for Op_Beta pagination test...\n";
for ($i = 1; $i <= 55; $i++) {
    $title = "Pagination Test Directive No. " . str_pad($i, 2, '0', STR_PAD_LEFT);
    $priority = ($i % 3) + 1; // Maps to 1, 2, 3
    $status = ($i % 5 === 0) ? 1 : 0; // Every 5th task is completed
    $category = "Work"; // Default category from repo creation
    $points = 10;

    $dueDate = date('Y-m-d H:i:s', strtotime("+" . ($i % 10) . " days"));

    $stmt = $pdo->prepare("INSERT INTO tasks (user_id, title, category, priority, status, points_value, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$betaId, $title, $category, $priority, $status, $points, $dueDate]);
}
echo "   [V] 55 Directives initialized.\n\n";

// 3. Create 100 baseline users for Admin pagination
echo "3. Generating 100 baseline users for Admin Datagrid pagination test...\n";
$insertUserStmt = $pdo->prepare("INSERT INTO users (username, password, email, is_verified, role) VALUES (?, ?, ?, 1, 'user')");
$pdo->beginTransaction();
for ($i = 1; $i <= 200; $i++) {
    $uname = "Test_User_" . str_pad($i, 3, '0', STR_PAD_LEFT);
    $pass = password_hash('Baseline_Pass_1!', PASSWORD_DEFAULT);
    $email = "test.user.$i@cybertasker.local";
    $insertUserStmt->execute([$uname, $pass, $email]);
    $uid = $pdo->lastInsertId();
    // Insert stats row to prevent foreign key errors later
    $pdo->prepare("INSERT INTO user_stats (id, total_points, current_level, badges_json) VALUES (?, 0, 1, '[]')")->execute([$uid]);
}
$pdo->commit();
echo "   [V] 100 baseline test users injected into registry.\n\n";

echo "====================================================\n";
echo "SEED COMPLETE. System ready for automated test suites.\n";

?>