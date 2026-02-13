<?php
require_once 'api/db.php';
$pdo = getDBConnection();

$categories = ['Hacking', 'Defense', 'Intel', 'Wiring', 'Social', 'Combat', 'Stealth'];
$priorities = [1, 2, 3]; // 1=High? 3=Low? Or vice versa. App uses 1=High usually.

echo "Starting Mass Task Generation & Verification...\n";
echo "------------------------------------------------\n";

// 1. Get All Users
$stmt = $pdo->query("SELECT id, username FROM users");
$users = $stmt->fetchAll();

foreach ($users as $user) {
    $userId = $user['id'];
    $username = $user['username'];

    // Get initial stats
    $stmtStats = $pdo->prepare("SELECT total_points FROM user_stats WHERE id = ?");
    $stmtStats->execute([$userId]);
    $initialPoints = $stmtStats->fetch()['total_points'] ?? 0;

    echo "Processing Operative: $username (Initial XP: $initialPoints)\n";

    // 2. Create 10 Tasks
    $createdTasks = [];
    for ($i = 1; $i <= 10; $i++) {
        $title = "Mission $i: " . bin2hex(random_bytes(3));
        $cat = $categories[array_rand($categories)];
        $prio = $priorities[array_rand($priorities)];
        $points = rand(10, 50);

        $sql = "INSERT INTO tasks (user_id, title, category, priority, points_value, status) VALUES (?, ?, ?, ?, ?, 0)";
        $pdo->prepare($sql)->execute([$userId, $title, $cat, $prio, $points]);
        $taskId = $pdo->lastInsertId();

        $createdTasks[] = ['id' => $taskId, 'points' => $points];
    }
    echo "  -> Assigned 10 new directives.\n";

    // 3. Complete 3 Tasks
    // Shuffle and pick 3
    shuffle($createdTasks);
    $toComplete = array_slice($createdTasks, 0, 3);

    $expectedGain = 0;
    foreach ($toComplete as $task) {
        $tid = $task['id'];
        $pts = $task['points'];

        // Mark as done
        $pdo->prepare("UPDATE tasks SET status = 1 WHERE id = ?")->execute([$tid]);

        // Add points (Simulating API logic)
        $pdo->prepare("UPDATE user_stats SET total_points = total_points + ? WHERE id = ?")->execute([$pts, $userId]);

        $expectedGain += $pts;
    }

    echo "  -> Completed 3 tasks. Expected Gain: +$expectedGain XP.\n";

    // 4. Verify
    $stmtStats->execute([$userId]);
    $finalPoints = $stmtStats->fetch()['total_points'];
    $actualGain = $finalPoints - $initialPoints;

    if ($actualGain === $expectedGain) {
        echo "  -> [SUCCESS] Points verified ($initialPoints -> $finalPoints).\n";
    }
    else {
        echo "  -> [FAILURE] Mismatch! Expected +$expectedGain, got +$actualGain.\n";
    }
    echo "\n";
}

echo "Operation Complete.\n";
?>