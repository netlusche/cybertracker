<?php
// auth.php
require_once 'db.php';
require_once 'TOTP.php';

header("Content-Type: application/json");
session_start();

$pdo = getDBConnection();
$data = json_decode(file_get_contents("php://input"), true);
$action = $_GET['action'] ?? '';

// --- 2FA ACTIONS ---

if ($action === 'setup_2fa') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT username FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $username = $stmt->fetchColumn();

    $secret = TOTP::generateSecret();
    $url = TOTP::getProvisioningUri($username, $secret, 'CyberTracker');

    echo json_encode(['secret' => $secret, 'qr_url' => $url]);
}

elseif ($action === 'enable_2fa') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }

    $secret = $data['secret'] ?? '';
    $code = $data['code'] ?? '';

    if (TOTP::verifyCode($secret, $code)) {
        $stmt = $pdo->prepare("UPDATE users SET two_factor_secret = ?, two_factor_enabled = 1 WHERE id = ?");
        $stmt->execute([$secret, $_SESSION['user_id']]);
        echo json_encode(['success' => true, 'message' => '2FA Enabled']);
    }
    else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid Code']);
    }
}

elseif ($action === 'disable_2fa') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }

    // Optional: Verify password before disabling (Skipping for now as per "simple button" request, but can be added if needed)

    $stmt = $pdo->prepare("UPDATE users SET two_factor_enabled = 0, two_factor_secret = NULL WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    echo json_encode(['success' => true, 'message' => '2FA Disabled']);
}

elseif ($action === 'verify_2fa') {
    if (!isset($_SESSION['partial_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'No login attempt found']);
        exit;
    }

    $code = $data['code'] ?? '';
    $userId = $_SESSION['partial_id'];

    $stmt = $pdo->prepare("SELECT two_factor_secret FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $secret = $stmt->fetchColumn();

    if (TOTP::verifyCode($secret, $code)) {
        // Promote to full session
        $_SESSION['user_id'] = $userId;
        unset($_SESSION['partial_id']);

        // Fetch user data for response
        $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        $stmtStats = $pdo->prepare("SELECT * FROM user_stats WHERE id = ?");
        $stmtStats->execute([$userId]);
        $stats = $stmtStats->fetch();

        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'role' => $user['role'],
                'two_factor_enabled' => (bool)$user['two_factor_enabled'],
                'stats' => $stats
            ]
        ]);
    }
    else {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid Code']);
    }
}

// --- STANDARD AUTH ACTIONS ---

elseif ($action === 'register') {
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';

    if (!$username || !$password) {
        http_response_code(400);
        echo json_encode(['error' => 'Username and password required']);
        exit;
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);

    try {
        $stmt = $pdo->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
        $stmt->execute([$username, $hash]);
        $userId = $pdo->lastInsertId();

        $pdo->exec("INSERT INTO user_stats (id, total_points, current_level, badges_json) VALUES ($userId, 0, 1, '[]')");

        echo json_encode(['success' => true, 'message' => 'User registered']);
    }
    catch (PDOException $e) {
        http_response_code(409);
        echo json_encode(['error' => 'Username already exists']);
    }
}

elseif ($action === 'login') {
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';

    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {

        // Check 2FA
        if ($user['two_factor_enabled']) {
            $_SESSION['partial_id'] = $user['id'];
            echo json_encode(['success' => true, 'requires_2fa' => true]);
            exit;
        }

        // Standard Login
        $_SESSION['user_id'] = $user['id'];

        $stmtStats = $pdo->prepare("SELECT * FROM user_stats WHERE id = ?");
        $stmtStats->execute([$user['id']]);
        $stats = $stmtStats->fetch();

        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'role' => $user['role'],
                'two_factor_enabled' => (bool)$user['two_factor_enabled'],
                'stats' => $stats
            ]
        ]);
    }
    else {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
    }

}
elseif ($action === 'logout') {
    session_destroy();
    echo json_encode(['success' => true]);
}
elseif ($action === 'change_password') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }

    $userId = $_SESSION['user_id'];
    $currentPassword = $data['current_password'] ?? '';
    $newPassword = $data['new_password'] ?? '';

    $stmt = $pdo->prepare("SELECT password FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if ($user && password_verify($currentPassword, $user['password'])) {
        $newHash = password_hash($newPassword, PASSWORD_DEFAULT);
        $updateStmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
        $updateStmt->execute([$newHash, $userId]);
        echo json_encode(['success' => true, 'message' => 'Password updated']);
    }
    else {
        http_response_code(401);
        echo json_encode(['error' => 'Incorrect current password']);
    }

}
elseif ($action === 'delete_account') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }

    $userId = $_SESSION['user_id'];
    $password = $data['password'] ?? '';

    $stmt = $pdo->prepare("SELECT password FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        $pdo->prepare("DELETE FROM tasks WHERE user_id = ?")->execute([$userId]);
        $pdo->prepare("DELETE FROM user_stats WHERE id = ?")->execute([$userId]);
        $pdo->prepare("DELETE FROM users WHERE id = ?")->execute([$userId]);

        session_destroy();
        echo json_encode(['success' => true, 'message' => 'Account terminated']);
    }
    else {
        http_response_code(401);
        echo json_encode(['error' => 'Incorrect password']);
    }

}
else {
    // Check Status
    if (isset($_SESSION['user_id'])) {
        $stmt = $pdo->prepare("SELECT id, username, role, two_factor_enabled FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch();

        $stmtStats = $pdo->prepare("SELECT * FROM user_stats WHERE id = ?");
        $stmtStats->execute([$_SESSION['user_id']]);
        $stats = $stmtStats->fetch();

        if ($user) {
            echo json_encode([
                'isAuthenticated' => true,
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'role' => $user['role'],
                    'two_factor_enabled' => (bool)$user['two_factor_enabled'],
                    'stats' => $stats
                ]
            ]);
            exit;
        }
    }
    echo json_encode(['isAuthenticated' => false]);
}
?>