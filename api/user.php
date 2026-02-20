<?php
// user.php
require_once 'db.php';
require_once 'csrf.php';

session_save_path(__DIR__ . "/sessions");
session_start();
verify_csrf_token();

header("Content-Type: application/json");

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$userId = $_SESSION['user_id'];
$pdo = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $sql = "SELECT * FROM user_stats WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    // Logic for Level Calc matches previous logic
    if ($user) {
        $points = $user['total_points'];
        $calculatedLevel = floor($points / 100) + 1;

        if ($calculatedLevel > $user['current_level']) {
            $updateSql = "UPDATE user_stats SET current_level = ? WHERE id = ?";
            $updateStmt = $pdo->prepare($updateSql);
            $updateStmt->execute([$calculatedLevel, $userId]);
            $user['current_level'] = $calculatedLevel;
            $user['leveled_up'] = true;
        }
    }

    echo json_encode($user);
}
?>