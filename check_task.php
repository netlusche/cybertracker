<?php
require_once 'api/db.php';
$pdo = getDBConnection();

$title = $argv[1] ?? 'Doomed Task';

$stmt = $pdo->prepare("SELECT count(*) as count FROM tasks WHERE title = ?");
$stmt->execute([$title]);
$count = $stmt->fetch()['count'];

if ($count > 0) {
    echo "Task '$title' EXISTS in database.\n";
}
else {
    echo "Task '$title' does NOT exist.\n";
}
?>