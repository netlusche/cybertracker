<?php
ini_set('display_errors', 1); error_reporting(E_ALL);
require 'api/config.php';
require 'api/db.php';
require 'api/repositories/TaskStatusRepository.php';

$pdo = getDBConnection();
$userId = 1;
$name = 'Q/A TEST';

// Mimic store()
$stmt = $pdo->prepare("SELECT id, sort_order FROM user_task_statuses WHERE user_id = ? AND name = 'completed'");
$stmt->execute([$userId]);
$completedStatus = $stmt->fetch(PDO::FETCH_ASSOC);

if ($completedStatus) {
    echo "Found completed status: sort_order=" . $completedStatus['sort_order'] . "\n";
    $completedOrder = (int)$completedStatus['sort_order'];
    $shiftStmt = $pdo->prepare("UPDATE user_task_statuses SET sort_order = sort_order + 1 WHERE user_id = ? AND sort_order >= ?");
    $shiftStmt->execute([$userId, $completedOrder]);
    echo "Shifted statuses.\n";
    $newSortOrder = $completedOrder;
} else {
    echo "Completed status not found.\n";
    $newSortOrder = 99;
}

$repo = new TaskStatusRepository($pdo);
$res = $repo->createStatus($userId, $name, 0, $newSortOrder);
echo "Result:\n";
print_r($res);
