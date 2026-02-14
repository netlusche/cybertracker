<?php
// install.php
// Universal Installer for both MySQL/MariaDB and SQLite
require_once 'db.php';

// Detect DB Type from config or default to mysql
$dbType = defined('DB_TYPE') ? DB_TYPE : 'mysql';

echo "Installing CyberTasker Database ($dbType)...<br>\n";

/**
 * Check if a table exists
 */
function tableExists($pdo, $table)
{
    global $dbType;
    try {
        if ($dbType === 'sqlite') {
            $stmt = $pdo->prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?");
            $stmt->execute([$table]);
            return $stmt->fetch() !== false;
        }
        else {
            $stmt = $pdo->query("SHOW TABLES LIKE '$table'");
            return $stmt->rowCount() > 0;
        }
    }
    catch (PDOException $e) {
        return false;
    }
}

/**
 * Check if a column exists in a table
 */
function columnExists($pdo, $table, $column)
{
    global $dbType;
    try {
        if ($dbType === 'sqlite') {
            $stmt = $pdo->query("PRAGMA table_info($table)");
            $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($columns as $col) {
                if ($col['name'] === $column)
                    return true;
            }
            return false;
        }
        else {
            $stmt = $pdo->query("SHOW COLUMNS FROM $table LIKE '$column'");
            return $stmt->rowCount() > 0;
        }
    }
    catch (PDOException $e) {
        return false;
    }
}

try {
    $pdo = getDBConnection();

    // --- USERS TABLE ---
    $autoIncrement = ($dbType === 'sqlite') ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTO_INCREMENT PRIMARY KEY';
    $sqlUsers = "CREATE TABLE IF NOT EXISTS users (
        id $autoIncrement,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $pdo->exec($sqlUsers);
    echo "Table 'users' check/create complete.<br>\n";

    // Add columns if missing (Schema Evolution)
    $newColumns = [
        'role' => "VARCHAR(20) DEFAULT 'user'",
        'two_factor_enabled' => "BOOLEAN DEFAULT 0",
        'two_factor_secret' => "VARCHAR(32) NULL",
        'email' => "VARCHAR(255) UNIQUE DEFAULT NULL",
        'is_verified' => "BOOLEAN DEFAULT 1",
        'verification_token' => "VARCHAR(64) DEFAULT NULL",
        'reset_token' => "VARCHAR(64) DEFAULT NULL",
        'reset_expires' => "DATETIME DEFAULT NULL"
    ];

    foreach ($newColumns as $col => $def) {
        if (!columnExists($pdo, 'users', $col)) {
            $pdo->exec("ALTER TABLE users ADD COLUMN $col $def");
            echo "Column '$col' added to users.<br>\n";
        }
    }

    // --- TASKS TABLE ---
    $sqlTasks = "CREATE TABLE IF NOT EXISTS tasks (
        id $autoIncrement,
        user_id INT,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(50) DEFAULT 'General',
        priority INT DEFAULT 2,
        status BOOLEAN DEFAULT 0,
        points_value INT DEFAULT 10,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $pdo->exec($sqlTasks);
    echo "Table 'tasks' check/create complete.<br>\n";

    if (!columnExists($pdo, 'tasks', 'user_id')) {
        $pdo->exec("ALTER TABLE tasks ADD COLUMN user_id INT");
        echo "Column 'user_id' added to tasks.<br>\n";
    }

    // --- USER STATS TABLE ---
    $pk = ($dbType === 'sqlite') ? 'INTEGER PRIMARY KEY' : 'INT PRIMARY KEY';
    $jsonType = ($dbType === 'sqlite') ? 'TEXT' : 'JSON'; // SQLite doesn't have a native JSON type, stored as TEXT but supports JSON func

    $sqlUserStats = "CREATE TABLE IF NOT EXISTS user_stats (
        id $pk,
        total_points INT DEFAULT 0,
        current_level INT DEFAULT 1,
        badges_json $jsonType
    )";
    $pdo->exec($sqlUserStats);
    echo "Table 'user_stats' check/create complete.<br>\n";

    // --- DEFAULT ADMIN USER ---
    $adminUsername = 'admin';
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$adminUsername]);

    if (!$stmt->fetch()) {
        $adminPassword = password_hash('password', PASSWORD_DEFAULT);

        // Insert Admin
        $stmt = $pdo->prepare("INSERT INTO users (username, password, role, is_verified) VALUES (?, ?, 'admin', 1)");
        $stmt->execute([$adminUsername, $adminPassword]);
        $adminId = $pdo->lastInsertId();

        // Initialize Stats
        $stmtStats = $pdo->prepare("INSERT INTO user_stats (id, total_points, current_level, badges_json) VALUES (?, 0, 1, '[]')");
        $stmtStats->execute([$adminId]);

        echo "Default Admin user 'admin' created.<br>\n";
    }
    else {
        echo "Admin user already exists.<br>\n";
    }

    // --- SYSTEM SETTINGS TABLE ---
    $sqlSettings = "CREATE TABLE IF NOT EXISTS system_settings (
        setting_key VARCHAR(50) PRIMARY KEY,
        setting_value VARCHAR(255)
    )";
    $pdo->exec($sqlSettings);
    echo "Table 'system_settings' check/create complete.<br>\n";

    // Default Settings
    $stmt = $pdo->prepare("SELECT setting_value FROM system_settings WHERE setting_key = ?");
    $stmt->execute(['strict_password_policy']);
    if (!$stmt->fetch()) {
        $pdo->prepare("INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?)")
            ->execute(['strict_password_policy', '0']);
        echo "Default setting 'strict_password_policy' initialized to '0'.<br>\n";
    }

    echo "Installation/Update Complete!";

}
catch (PDOException $e) {
    // Show error but hide credentials if possible
    echo "Error: " . $e->getMessage();
    exit(1);
}
?>