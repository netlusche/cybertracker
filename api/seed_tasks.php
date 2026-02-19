<?php
// seed_tasks.php
require_once 'db.php';

// Force error display for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

$pdo = getDBConnection();

// Get admin user id
$stmt = $pdo->prepare("SELECT id FROM users WHERE username = 'admin' LIMIT 1");
$stmt->execute();
$admin = $stmt->fetch();

if (!$admin) {
    die("Error: Admin user not found in the 'users' table.");
}

$adminId = $admin['id'];
$count = 150;

echo "Seeding $count tasks for admin (ID: $adminId)...\n";

try {
    $pdo->beginTransaction();

    // Clear existing tasks for admin to avoid duplicates if re-running
    $pdo->prepare("DELETE FROM tasks WHERE user_id = ?")->execute([$adminId]);

    $stmt = $pdo->prepare("INSERT INTO tasks (user_id, title, category, priority, points_value, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))");

    for ($i = 1; $i <= $count; $i++) {
        $priority = ($i % 3) + 1;
        $category = ($i % 2 === 0) ? 'Neural Link' : 'Hardware';
        $title = "Directive " . str_pad($i, 3, '0', STR_PAD_LEFT) . ": Automated System Probe";
        $points = 10 + (3 - $priority) * 5;

        $stmt->execute([$adminId, $title, $category, $priority, $points]);
    }

    $pdo->commit();
    echo "SUCCESS: Seeded $count tasks for user ID $adminId.\n";
}
catch (Exception $e) {
    $pdo->rollBack();
    echo "FATAL ERROR: " . $e->getMessage() . "\n";
}
?>