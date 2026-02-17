<?php
// config.php
// Database configuration

// Check for local configuration override (for development)
if (file_exists(__DIR__ . '/config.local.php')) {
    require_once __DIR__ . '/config.local.php';
}

// Database configuration defaults (used if not defined in config.local.php)
if (!defined('DB_TYPE'))
    define('DB_TYPE', 'sqlite'); // 'mysql' or 'sqlite' (default)
if (!defined('DB_HOST'))
    define('DB_HOST', 'localhost');
if (!defined('DB_NAME'))
    define('DB_NAME', 'cybertracker');
if (!defined('DB_USER'))
    define('DB_USER', 'Your_DB_Username');
if (!defined('DB_PASS'))
    define('DB_PASS', 'Your_DB_Password');

// Global Configuration
if (!defined('FRONTEND_URL')) {
    // Determine base URL automatically or default to local Vite dev server
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    define('FRONTEND_URL', $protocol . '://' . ($_SERVER['HTTP_HOST'] ?? 'localhost:5173'));
}

// CORS Configuration – Allow local development
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>