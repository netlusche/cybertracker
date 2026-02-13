<?php
require_once 'api/db.php';
$pdo = getDBConnection();

$username = 'Frank';
$password = 'password';
$hash = password_hash($password, PASSWORD_DEFAULT);

// Check if Frank exists
$stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
$stmt->execute([$username]);
$user = $stmt->fetch();

if ($user) {
    // Update to Admin
    $pdo->prepare("UPDATE users SET role = 'admin', password = ? WHERE id = ?")->execute([$hash, $user['id']]);
    echo "Frank updated to Admin with password 'password'.\n";
}
else {
    // Create Frank as Admin
    $pdo->prepare("INSERT INTO users (username, password, role) VALUES (?, ?, 'admin')")->execute([$username, $hash]);
    echo "Frank created as Admin with password 'password'.\n";

    // Init stats
    $id = $pdo->lastInsertId();
    $pdo->exec("INSERT INTO user_stats (id, total_points, current_level, badges_json) VALUES ($id, 0, 1, '[]')");
}
?>