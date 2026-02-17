<?php
// config.local.php
// Local development configuration for SQLite
define('DB_TYPE', 'sqlite');
define('DB_NAME', __DIR__ . '/../cybertracker.db');
define('DB_USER', ''); // Not used for SQLite but required by PDO constructor in db.php
define('DB_PASS', ''); // Not used for SQLite but required by PDO constructor in db.php
define('FRONTEND_URL', 'http://localhost:5173');
?>