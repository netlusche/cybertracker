<?php
// config.php
// Database configuration for Local Environment
define('DB_HOST', 'localhost'); // Switch to localhost for socket connection
define('DB_NAME', 'cybertracker_local'); 
define('DB_USER', 'frank'); // Using system user
define('DB_PASS', ''); 

// CORS Configuration - Allow local development
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>