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
    define('DB_NAME', __DIR__ . '/cybertracker.db');
if (!defined('DB_USER'))
    define('DB_USER', 'Your_DB_Username');
if (!defined('DB_PASS'))
    define('DB_PASS', 'Your_DB_Password');

// Global Configuration
if (!defined('FRONTEND_URL')) {
    // Determine protocol: Check direct HTTPS first, then common proxy headers
    $isHttps = (
        (isset($_SERVER['HTTPS']) && ($_SERVER['HTTPS'] === 'on' || $_SERVER['HTTPS'] == 1)) ||
        (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') ||
        (isset($_SERVER['HTTP_X_FORWARDED_SSL']) && $_SERVER['HTTP_X_FORWARDED_SSL'] === 'on')
        );

    $protocol = $isHttps ? 'https' : 'http';
    $scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
    $scriptDir = $scriptName ? rtrim(dirname($scriptName), '/api') : '';
    define('FRONTEND_URL', $protocol . '://' . ($_SERVER['HTTP_HOST'] ?? 'localhost:5173') . $scriptDir);
}

// CORS Configuration - Restrict to Frontend Domain
$parsedUrl = parse_url(FRONTEND_URL);
$allowedOrigin = ($parsedUrl['scheme'] ?? 'http') . '://' . ($parsedUrl['host'] ?? 'localhost');
if (isset($parsedUrl['port'])) {
    $allowedOrigin .= ':' . $parsedUrl['port'];
}
header("Access-Control-Allow-Origin: " . $allowedOrigin);
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token");

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
}