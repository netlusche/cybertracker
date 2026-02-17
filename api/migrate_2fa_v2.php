<?php
require_once 'db.php';

try {
    $pdo = getDBConnection();

    // Add columns if they don't exist
    $sql = "
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS two_factor_method VARCHAR(20) DEFAULT 'totp';
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS two_factor_backup_codes TEXT DEFAULT NULL;
    ";

    // SQLite doesn't support multiple commands in one exec for some drivers, 
    // and doesn't support ADD COLUMN IF NOT EXISTS in old versions easily if not handled.
    // However, for CyberTasker we use a simple approach.

    $pdo->exec("ALTER TABLE users ADD COLUMN two_factor_method VARCHAR(20) DEFAULT 'totp'");
    $pdo->exec("ALTER TABLE users ADD COLUMN two_factor_backup_codes TEXT DEFAULT NULL");

    echo "Database updated successfully: Added 2FA method and backup code columns.\n";

}
catch (PDOException $e) {
    if (strpos($e->getMessage(), "duplicate column name") !== false || strpos($e->getMessage(), "already exists") !== false) {
        echo "Columns already exist. Skipping.\n";
    }
    else {
        die("Migration failed: " . $e->getMessage() . "\n");
    }
}
?>
