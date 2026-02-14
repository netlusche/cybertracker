<?php
// admin.php
require_once 'db.php';
session_start();
header("Content-Type: application/json");
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");

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

if ($method === 'GET') {
    if ($action === 'list') {
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        if ($page < 1)
            $page = 1;
        $limit = 10;
        $offset = ($page - 1) * $limit;

        // Sorting Parameters
        $allowedSorts = ['id', 'username', 'is_verified', 'last_login'];
        $sortBy = $_GET['sort'] ?? 'id';
        $sortDir = strtoupper($_GET['dir'] ?? 'ASC');

        if (!in_array($sortBy, $allowedSorts))
            $sortBy = 'id';
        if ($sortDir !== 'ASC' && $sortDir !== 'DESC')
            $sortDir = 'ASC';

        // Count total users
        $totalStmt = $pdo->query("SELECT COUNT(*) FROM users");
        $totalUsers = (int)$totalStmt->fetchColumn();
        $totalPages = (int)ceil($totalUsers / $limit);

        // Fetch users (Admins first, then dynamic sort)
        // Note: We prioritize admins (role='admin' -> 0)
        $sql = "SELECT id, username, role, is_verified, created_at, last_login 
                FROM users 
                ORDER BY (CASE WHEN role = 'admin' THEN 0 ELSE 1 END), $sortBy $sortDir 
                LIMIT :limit OFFSET :offset";

        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'users' => $users,
            'totalUsers' => $totalUsers,
            'totalPages' => $totalPages,
            'currentPage' => $page
        ]);
    }
    elseif ($action === 'get_settings') {
        try {
            error_log("Admin API: Fetching settings...");
            $stmt = $pdo->query("SELECT setting_key, setting_value FROM system_settings");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $settings = [];
            foreach ($rows as $row) {
                $settings[$row['setting_key']] = $row['setting_value'];
            }
            error_log("Admin API: Settings fetched: " . json_encode($settings));
            echo json_encode($settings);
        }
        catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if ($action === 'toggle_verified') {
        $targetId = $data['target_id'];

        // Get current status and role
        $stmt = $pdo->prepare("SELECT role, is_verified FROM users WHERE id = ?");
        $stmt->execute([$targetId]);
        $targetUser = $stmt->fetch();

        if (!$targetUser) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            exit;
        }

        $newStatus = $targetUser['is_verified'] ? 0 : 1;

        // Safety Check: If revoking verification (1 -> 0) AND user is Admin
        if ($newStatus === 0 && $targetUser['role'] === 'admin') {
            // Count OTHER verified admins
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM users WHERE role = 'admin' AND is_verified = 1");
            $count = $stmt->fetch()['count'];

            // If this user is verified, they are part of that count. 
            // We need to ensure that *after* they are unverified, there is still at least 1 verified admin.
            // Actually, simply: if count <= 1, it means THIS is the only verified admin (or there are 0, which shouldn't happen if we are logged in).

            if ($count <= 1) {
                http_response_code(409);
                echo json_encode(['error' => 'Cannot unverify the last verified Admin.']);
                exit;
            }
        }

        $update = $pdo->prepare("UPDATE users SET is_verified = ? WHERE id = ?");
        $update->execute([$newStatus, $targetId]);
        echo json_encode(['success' => true, 'new_status' => $newStatus]);
    }

    elseif ($action === 'update_role') {
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

    elseif ($action === 'update_setting') {
        $key = $data['key'] ?? null;
        $value = $data['value'] ?? null;

        if (!$key) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing setting key']);
            exit;
        }

        // Whitelist allowed settings to prevent arbitrary insertion
        $allowedSettings = ['strict_password_policy'];
        if (!in_array($key, $allowedSettings)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid setting key: ' . htmlspecialchars($key)]);
            exit;
        }

        // REPLACE INTO works for both MySQL and SQLite
        $stmt = $pdo->prepare("REPLACE INTO system_settings (setting_key, setting_value) VALUES (?, ?)");
        $stmt->execute([$key, $value]);

        echo json_encode(['success' => true]);
    }
}
?>