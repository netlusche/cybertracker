<?php
// router.php
// Router for PHP built-in server

$uri = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);
$file = __DIR__ . $uri;

// If it's an API request, let standard PHP execution handle it (via standard include/require or letting the server find the file)
if (strpos($uri, '/api/') === 0) {
    if (file_exists($file) && !is_dir($file)) {
        return false; // serve the requested resource as-is.
    }
    elseif (file_exists($file . '.php')) {
        include $file . '.php'; // Execute the PHP file
        return true;
    }
}

// Serve static files if they exist
if (file_exists($file) && !is_dir($file)) {
    return false; // serve the requested resource as-is.
}

// Otherwise serve index.html for React Router (SPA)
include __DIR__ . '/index.html';
?>