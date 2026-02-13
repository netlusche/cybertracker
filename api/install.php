<?php
// install.php
require_once 'db.php';

echo "Installing CyberTasker Database...<br>";

try {
    $pdo = getDBConnection();

    // Create Users Table
    $sqlUsers = "CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $pdo->exec($sqlUsers);
    echo "Table 'users' created (or already exists).<br>";

    // Check for 'role' column
    try {
        $check = $pdo->query("SHOW COLUMNS FROM users LIKE 'role'");
        if ($check->rowCount() == 0) {
            $pdo->exec("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user'");
            echo "Column 'role' added to users.<br>";
        }
    }
    catch (Exception $e) { /* Ignore */
    }

    // Check for 'two_factor_enabled' column
    try {
        $check = $pdo->query("SHOW COLUMNS FROM users LIKE 'two_factor_enabled'");
        if ($check->rowCount() == 0) {
            $pdo->exec("ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT 0");
            $pdo->exec("ALTER TABLE users ADD COLUMN two_factor_secret VARCHAR(32) NULL");
            echo "Columns 'two_factor_enabled' and 'two_factor_secret' added to users.<br>";
        }
    }

    catch (Exception $e) { /* Ignore */
    }

    // Check for 'email' and related columns (Phase 2)
    try {
        $check = $pdo->query("SHOW COLUMNS FROM users LIKE 'email'");
        if ($check->rowCount() == 0) {
            $pdo->exec("ALTER TABLE users ADD COLUMN email VARCHAR(255) UNIQUE DEFAULT NULL");
            $pdo->exec("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT 1"); // Default 1 for existing users
            $pdo->exec("ALTER TABLE users ADD COLUMN verification_token VARCHAR(64) DEFAULT NULL");
            $pdo->exec("ALTER TABLE users ADD COLUMN reset_token VARCHAR(64) DEFAULT NULL");
            $pdo->exec("ALTER TABLE users ADD COLUMN reset_expires DATETIME DEFAULT NULL");
            echo "Columns 'email', 'is_verified', and tokens added to users.<br>";
        }
    }
    catch (Exception $e) { /* Ignore */
    }

    // Create Tasks Table
    $sqlTasks = "CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(50) DEFAULT 'General',
        priority INT DEFAULT 2,
        status BOOLEAN DEFAULT 0,
        points_value INT DEFAULT 10,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $pdo->exec($sqlTasks);
    echo "Table 'tasks' created (or already exists).<br>";

    // Add user_id column if not exists (upgrade path)
    try {
        $check = $pdo->query("SHOW COLUMNS FROM tasks LIKE 'user_id'");
        if ($check->rowCount() == 0) {
            $pdo->exec("ALTER TABLE tasks ADD COLUMN user_id INT");
            echo "Column 'user_id' added to tasks.<br>";
        }
    }
    catch (Exception $e) { /* Ignore */
    }


    // Create User Stats Table
    $sqlUser = "CREATE TABLE IF NOT EXISTS user_stats (
        id INT PRIMARY KEY,
        total_points INT DEFAULT 0,
        current_level INT DEFAULT 1,
        badges_json JSON
    )";
    $pdo->exec($sqlUser);
    echo "Table 'user_stats' created (or already exists).<br>";

    // --- DEFAULT ADMIN USER ---
    $adminUsername = 'admin';
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$adminUsername]);
    if (!$stmt->fetch()) {
        $adminPassword = password_hash('password', PASSWORD_DEFAULT);
        $pdo->prepare("INSERT INTO users (username, password, role) VALUES (?, ?, 'admin')")->execute([$adminUsername, $adminPassword]);
        $adminId = $pdo->lastInsertId();
        $pdo->exec("INSERT INTO user_stats (id, total_points, current_level, badges_json) VALUES ($adminId, 0, 1, '[]')");
        echo "Default Admin user 'admin' created.<br>";
    }

    echo "Installation/Update Complete!";

    echo "Installation/Update Complete!";

}
catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>