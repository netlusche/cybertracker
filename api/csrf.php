<?php
// api/csrf.php
if (session_status() === PHP_SESSION_NONE) {
    session_save_path(__DIR__ . "/sessions");
    session_start();
}

// Generate CSRF token if one doesn't exist
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

function verify_csrf_token()
{
    $method = $_SERVER['REQUEST_METHOD'];
    if (in_array($method, ['POST', 'PUT', 'DELETE'])) {
        $headers = getallheaders();
        $token = $headers['X-CSRF-Token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';

        if (empty($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $token)) {
            http_response_code(403);
            echo json_encode(['error' => 'CSRF Token Mismatch / Security Invalid']);
            exit;
        }
    }
}
?>