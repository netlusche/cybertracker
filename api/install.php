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

            // Make the first user an admin automatically if they exist
            $pdo->exec("UPDATE users SET role = 'admin' ORDER BY id ASC LIMIT 1");
            echo "First user promoted to Admin.<br>";
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

    echo "Installation/Update Complete!";

}
catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>