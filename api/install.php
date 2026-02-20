<?php
// install.php
// Universal Installer for both MySQL/MariaDB and SQLite with Diagnostics

// Enable error reporting explicitly for installer troubleshooting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once 'db.php';

// Detect DB Type from config or default to mysql
$dbType = defined('DB_TYPE') ? DB_TYPE : 'mysql';

echo "<h3>CyberTasker Installer Diagnostic Mode</h3>\n";
echo "PHP Version: " . phpversion() . "<br>\n";
echo "PDO Drivers: " . implode(', ', PDO::getAvailableDrivers()) . "<br>\n";

echo "<h4>Checking config constants...</h4>\n";
echo "DB_TYPE: " . (defined('DB_TYPE') ? DB_TYPE : "NOT DEFINED (defaulting to mysql)") . "<br>\n";
echo "DB_HOST: " . (defined('DB_HOST') ? DB_HOST : "NOT DEFINED") . "<br>\n";
echo "DB_NAME: " . (defined('DB_NAME') ? DB_NAME : "NOT DEFINED") . "<br>\n";
echo "DB_USER: " . (defined('DB_USER') ? substr(DB_USER, 0, 1) . "****" : "NOT DEFINED") . "<br>\n";

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
    echo "<h4>Attempting database connection...</h4>\n";
    $pdo = getDBConnection();
    echo "Database connection successful.<br>\n";

    if ($dbType === 'sqlite') {
        echo "SQLite DB File: " . DB_NAME . "<br>\n";
        echo "Writable: " . (is_writable(DB_NAME) ? 'YES' : 'NO') . "<br>\n";
    }
    else {
        echo "MySQL Host: " . DB_HOST . "<br>\n";
        echo "MySQL DB Name: " . DB_NAME . "<br>\n";
    }

    echo "<h4>Checking Database Lock Status...</h4>\n";
    // Security 1.0: Zero-Config Auto-Lock
    // If the 'users' table exists, the system is considered initialized. 
    // To proceed with schema updates, the operative MUST be logged in as an Admin.
    if (tableExists($pdo, 'users')) {
        echo "System initialized ('users' table detected). Engaging Auto-Lock protocol.<br>\n";
        if (session_status() === PHP_SESSION_NONE) {
            // Secure session start to check credentials
            session_set_cookie_params([
                'lifetime' => 86400,
                'path' => '/',
                'secure' => isset($_SERVER['HTTPS']),
                'httponly' => true,
                'samesite' => 'Strict'
            ]);
            session_name('CYBER_SESSION');
            session_start();
        }

        if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
            http_response_code(403);
            echo "<h3 style='color: red;'>[ ACCESS DENIED: SECURITY AUTO-LOCK ]</h3>\n";
            echo "<p>The grid has already been initialized. To execute schema updates, you must establish an active neural link as an 'admin' via the main login terminal first.</p>\n";
            exit(1);
        }
        echo "<span style='color: green;'>ACCESS GRANTED: Active Admin session detected. Proceeding with schema update...</span><br>\n";
    }
    else {
        echo "<span style='color: yellow;'>SYSTEM EMPTY: First-time initialization detected. Auto-Lock bypassed.</span><br>\n";
    }

    // --- USERS TABLE ---
    $autoIncrement = ($dbType === 'sqlite') ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTO_INCREMENT PRIMARY KEY';

    // Improved schema for clean install
    $sqlUsers = "CREATE TABLE IF NOT EXISTS users (
        id $autoIncrement,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        two_factor_enabled BOOLEAN DEFAULT 0,
        two_factor_secret VARCHAR(32) NULL,
        email VARCHAR(255) UNIQUE DEFAULT NULL,
        is_verified BOOLEAN DEFAULT 1,
        verification_token VARCHAR(64) DEFAULT NULL,
        reset_token VARCHAR(64) DEFAULT NULL,
        reset_expires DATETIME DEFAULT NULL,
        last_login TIMESTAMP NULL DEFAULT NULL,
        theme VARCHAR(20) DEFAULT 'cyberpunk',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $pdo->exec($sqlUsers);
    echo "Table 'users' check/create complete.<br>\n";

    // Add columns if missing (Schema Evolution)
    $newColumns = [
        'role' => "VARCHAR(20) DEFAULT 'user'",
        'two_factor_enabled' => "BOOLEAN DEFAULT 0",
        'two_factor_secret' => "VARCHAR(32) NULL",
        'two_factor_method' => "VARCHAR(20) DEFAULT 'totp'",
        'two_factor_backup_codes' => "TEXT NULL",
        'email' => "VARCHAR(255) UNIQUE DEFAULT NULL",
        'is_verified' => "BOOLEAN DEFAULT 1",
        'verification_token' => "VARCHAR(64) DEFAULT NULL",
        'reset_token' => "VARCHAR(64) DEFAULT NULL",
        'reset_expires' => "DATETIME DEFAULT NULL",
        'last_login' => "TIMESTAMP NULL DEFAULT NULL",
        'theme' => "VARCHAR(20) DEFAULT 'cyberpunk'"
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
        due_date DATETIME DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $pdo->exec($sqlTasks);
    echo "Table 'tasks' check/create complete.<br>\n";

    // Add due_date if missing
    if (!columnExists($pdo, 'tasks', 'due_date')) {
        $pdo->exec("ALTER TABLE tasks ADD COLUMN due_date DATETIME DEFAULT NULL");
        echo "Column 'due_date' added to tasks.<br>\n";
    }

    // --- USER CATEGORIES TABLE ---
    $sqlCategories = "CREATE TABLE IF NOT EXISTS user_categories (
        id $autoIncrement,
        user_id INT NOT NULL,
        name VARCHAR(50) NOT NULL,
        is_default BOOLEAN DEFAULT 0,
        UNIQUE(user_id, name),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )";
    $pdo->exec($sqlCategories);
    echo "Table 'user_categories' check/create complete.<br>\n";

    if (!columnExists($pdo, 'user_categories', 'is_default')) {
        $pdo->exec("ALTER TABLE user_categories ADD COLUMN is_default BOOLEAN DEFAULT 0");
        echo "Column 'is_default' added to user_categories.<br>\n";
    }

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

    if (!columnExists($pdo, 'user_stats', 'badges_json')) {
        $pdo->exec("ALTER TABLE user_stats ADD COLUMN badges_json $jsonType");
        echo "Column 'badges_json' added to user_stats.<br>\n";
    }

    // --- AUTH LOGS TABLE (Rate Limiting) ---
    $sqlAuthLogs = "CREATE TABLE IF NOT EXISTS auth_logs (
        id $autoIncrement,
        ip_address VARCHAR(45) NOT NULL,
        endpoint VARCHAR(50) NOT NULL,
        success BOOLEAN NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $pdo->exec($sqlAuthLogs);
    echo "Table 'auth_logs' check/create complete.<br>\n";

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

        // --- INJECT SECURITY DIRECTIVES ---
        $directives = [
            ['OVERRIDE DEFAULT ACCESS: Update Access Key or initialize new Operative ID and terminate \'admin\' account.', 'Security', 1, 15],
            ['PURGE INSTALLER CORE: Terminate \'install.php\' from the server grid immediately.', 'Security', 1, 10],
            ['ACTIVATE NEURAL ENCRYPTION: Navigate to Admin Console and toggle \'STRICT_PASSWORD_POLICY\' to Level 1.', 'Security', 1, 10],
            ['SCRUB RESIDUAL TRACES: Remove \'install_test_user.php\' and other leftover test nodes.', 'Security', 2, 5],
            ['CALIBRATE NEURAL LINK: Perform a System Reset to optimize your ocular data stream.', 'System', 3, 5],
            ['UPGRADE COFFEE PROTOCOL: Ensure Operative Fuel levels are at maximum stability.', 'System', 3, 5]
        ];

        $stmtTask = $pdo->prepare("INSERT INTO tasks (user_id, title, category, priority, points_value) VALUES (?, ?, ?, ?, ?)");
        foreach ($directives as $d) {
            $stmtTask->execute([$adminId, $d[0], $d[1], $d[2], $d[3]]);
        }
        echo "Initial Admin security directives deployed.<br>\n";
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

    echo "<h4>Installation/Update Final Verification:</h4>";
    $tables = ['users', 'tasks', 'user_categories', 'user_stats', 'system_settings'];
    foreach ($tables as $t) {
        $count = $pdo->query("SELECT COUNT(*) FROM $t")->fetchColumn();
        echo "Table '$t' row count: <b>$count</b><br>\n";
    }

    echo "Installation/Update Complete!";

}
catch (PDOException $e) {
    echo "<h4>CRITICAL ERROR:</h4>";
    echo "Error: " . $e->getMessage() . "<br>\n";
    echo "SQL State: " . $e->getCode() . "<br>\n";
    exit(1);
}
catch (Throwable $t) {
    echo "<h4>GENERAL ERROR:</h4>";
    echo "Error: " . $t->getMessage() . "<br>\n";
    echo "File: " . $t->getFile() . " on line " . $t->getLine() . "<br>\n";
    exit(1);
}
?>