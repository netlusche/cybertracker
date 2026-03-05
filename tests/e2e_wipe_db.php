<?php
/**
 * e2e_wipe_db.php
 * Script to completely drop all tables to simulate a completely fresh environment.
 * Used exclusively by 00-installer.spec.js to test the initial setup.
 */

require_once __DIR__ . '/../api/db.php';
$pdo = getDBConnection();

$dbType = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);

if ($dbType === 'sqlite') {
    $pdo->exec("PRAGMA busy_timeout = 5000;");
    $pdo->exec("DROP TABLE IF EXISTS user_categories");
    $pdo->exec("DROP TABLE IF EXISTS tasks");
    $pdo->exec("DROP TABLE IF EXISTS auth_logs");
    $pdo->exec("DROP TABLE IF EXISTS user_stats");
    $pdo->exec("DROP TABLE IF EXISTS system_settings");
    $pdo->exec("DROP TABLE IF EXISTS users");
}
else {
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");
    $pdo->exec("DROP TABLE IF EXISTS user_categories");
    $pdo->exec("DROP TABLE IF EXISTS tasks");
    $pdo->exec("DROP TABLE IF EXISTS auth_logs");
    $pdo->exec("DROP TABLE IF EXISTS user_stats");
    $pdo->exec("DROP TABLE IF EXISTS system_settings");
    $pdo->exec("DROP TABLE IF EXISTS users");
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");
}

echo "e2e_wipe_db.php: All tables dropped successfully.\n";