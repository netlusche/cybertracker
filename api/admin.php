<?php
// admin.php
require_once 'db.php';
session_start();
header("Content-Type: application/json");

// Middleware: Verify Admin Role
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$pdo = getDBConnection();
$userId = $_SESSION['user_id'];

// Double check role from DB to be safe
$stmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch();

if (!$user || $user['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Access Denied: Admin Clearance Required']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'list';

if ($method === 'GET' && $action === 'list') {
    // List all users
    $stmt = $pdo->query("SELECT id, username, role, created_at FROM users ORDER BY id ASC");
    $users = $stmt->fetchAll();
    echo json_encode($users);

}
elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if ($action === 'update_role') {
        $targetId = $data['target_id'];
        $newRole = $data['new_role'];

        if ($newRole !== 'admin' && $newRole !== 'user') {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid role']);
            exit;
        }

        // Safety Check: If demoting (admin -> user), ensure at least 1 OTHER admin exists
        if ($newRole === 'user') {
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
            $res = $stmt->fetch(); // Total admins

            // Check if target IS an admin
            $stmt2 = $pdo->prepare("SELECT role FROM users WHERE id = ?");
            $stmt2->execute([$targetId]);
            $targetUser = $stmt2->fetch();

            if ($targetUser && $targetUser['role'] === 'admin' && $res['count'] <= 1) {
                http_response_code(409);
                echo json_encode(['error' => 'Cannot demote the last remaining Admin.']);
                exit;
            }
        }

        $update = $pdo->prepare("UPDATE users SET role = ? WHERE id = ?");
        $update->execute([$newRole, $targetId]);
        echo json_encode(['success' => true]);

    }
    elseif ($action === 'delete_user') {
        $targetId = $data['target_id'];

        // Safety Check: Cannot delete last admin
        $stmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
        $stmt->execute([$targetId]);
        $targetUser = $stmt->fetch();

        if ($targetUser && $targetUser['role'] === 'admin') {
            $stmtCount = $pdo->query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
            $count = $stmtCount->fetch()['count'];
            if ($count <= 1) {
                http_response_code(409);
                echo json_encode(['error' => 'Cannot delete the last remaining Admin.']);
                exit;
            }
        }

        // Proceed with deletion (Cascade manually)
        $pdo->prepare("DELETE FROM tasks WHERE user_id = ?")->execute([$targetId]);
        $pdo->prepare("DELETE FROM user_stats WHERE id = ?")->execute([$targetId]);
        $pdo->prepare("DELETE FROM users WHERE id = ?")->execute([$targetId]);

        echo json_encode(['success' => true]);

    }
    elseif ($action === 'reset_password') {
        $targetId = $data['target_id'];
        $newPass = $data['new_password'];

        if (!$newPass) {
            http_response_code(400);
            echo json_encode(['error' => 'No password provided']);
            exit;
        }

        $hash = password_hash($newPass, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
        $stmt->execute([$hash, $targetId]);

        echo json_encode(['success' => true, 'message' => 'Password reset']);
    }
}
?>