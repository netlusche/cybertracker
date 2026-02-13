<?php
require_once 'db.php';

try {
    $pdo = getDBConnection();

    // Add columns if they don't exist
    $sql = "
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(32) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT 0;
    ";

    $pdo->exec($sql);
    echo "Database updated successfully: Added 2FA columns to 'users' table.\n";

}
catch (PDOException $e) {
    die("Migration failed: " . $e->getMessage() . "\n");
}
?>