<?php
// auth.php
require_once 'db.php';

header("Content-Type: application/json");
session_start();

$pdo = getDBConnection();
$data = json_decode(file_get_contents("php://input"), true);
$action = $_GET['action'] ?? '';

if ($action === 'register') {
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';

    if (!$username || !$password) {
        http_response_code(400);
        echo json_encode(['error' => 'Username and password required']);
        exit;
    }

    // Hash password
    $hash = password_hash($password, PASSWORD_DEFAULT);

    try {
        $stmt = $pdo->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
        $stmt->execute([$username, $hash]);
        $userId = $pdo->lastInsertId();

        // Initialize stats
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
        $_SESSION['user_id'] = $user['id'];

        // Fetch stats
        $stmtStats = $pdo->prepare("SELECT * FROM user_stats WHERE id = ?");
        $stmtStats->execute([$user['id']]);
        $stats = $stmtStats->fetch();

        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'role' => $user['role'],
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

    if (!$currentPassword || !$newPassword) {
        http_response_code(400);
        echo json_encode(['error' => 'Current and new password required']);
        exit;
    }

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
    $password = $data['password'] ?? ''; // Confirm with password

    if (!$password) {
        http_response_code(400);
        echo json_encode(['error' => 'Password confirmation required']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT password FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        // Delete tasks first (foreign key manual handling if no CASCADE)
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
        $stmt = $pdo->prepare("SELECT id, username, role FROM users WHERE id = ?");
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
                    'stats' => $stats
                ]
            ]);
            exit;
        }
    }
    echo json_encode(['isAuthenticated' => false]);
}
?>