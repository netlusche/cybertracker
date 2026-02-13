<?php
require_once 'api/db.php';
$pdo = getDBConnection();

$categories = ['Hacking', 'Defense', 'Intel', 'Wiring', 'Social', 'Combat', 'Stealth'];
$priorities = [1, 2, 3];

echo "Starting Mass Task Generation (Round 2) & Level Verification...\n";
echo "------------------------------------------------\n";

// 1. Get All Users
$stmt = $pdo->query("SELECT id, username FROM users");
$users = $stmt->fetchAll();

foreach ($users as $user) {
    $userId = $user['id'];
    $username = $user['username'];

    // Get initial stats
    $stmtStats = $pdo->prepare("SELECT total_points, current_level FROM user_stats WHERE id = ?");
    $stmtStats->execute([$userId]);
    $stats = $stmtStats->fetch();
    $initialPoints = $stats['total_points'] ?? 0;
    $initialLevel = $stats['current_level'] ?? 1;

    echo "Processing Operative: $username (LVL $initialLevel | XP: $initialPoints)\n";

    // 2. Create 50 Tasks
    $createdTasks = [];
    $pdo->beginTransaction();
    for ($i = 1; $i <= 50; $i++) {
        $title = "Advanced Mission $i: " . bin2hex(random_bytes(3));
        $cat = $categories[array_rand($categories)];
        $prio = $priorities[array_rand($priorities)];
        $points = rand(15, 60); // Higher XP for advanced missions

        $sql = "INSERT INTO tasks (user_id, title, category, priority, points_value, status) VALUES (?, ?, ?, ?, ?, 0)";
        $pdo->prepare($sql)->execute([$userId, $title, $cat, $prio, $points]);
        $taskId = $pdo->lastInsertId();

        $createdTasks[] = ['id' => $taskId, 'points' => $points];
    }
    $pdo->commit();
    echo "  -> Assigned 50 new directives.\n";

    // 3. Complete 12 Tasks
    shuffle($createdTasks);
    $toComplete = array_slice($createdTasks, 0, 12);

    $expectedxpGain = 0;
    foreach ($toComplete as $task) {
        $tid = $task['id'];
        $pts = $task['points'];

        // Mark as done
        $pdo->prepare("UPDATE tasks SET status = 1 WHERE id = ?")->execute([$tid]);

        // Add points (Simulating api/tasks.php)
        $pdo->prepare("UPDATE user_stats SET total_points = total_points + ? WHERE id = ?")->execute([$pts, $userId]);

        $expectedxpGain += $pts;
    }

    // 4. Trigger Level Calculation (Simulating api/user.php GET)
    // In the real app, this happens when the frontend requests user stats.
    // Here we must manually replicate it or trigger it.
    // Let's replicate the logic from api/user.php:
    $stmtStats->execute([$userId]);
    $currentStats = $stmtStats->fetch();
    $currentPoints = $currentStats['total_points'];

    $calculatedLevel = floor($currentPoints / 100) + 1;

    // Update if needed
    if ($calculatedLevel > $currentStats['current_level']) {
        $pdo->prepare("UPDATE user_stats SET current_level = ? WHERE id = ?")->execute([$calculatedLevel, $userId]);
        echo "  -> [LEVEL UP] System updated level to $calculatedLevel.\n";
    }

    echo "  -> Completed 12 tasks. Expected Gain: +$expectedxpGain XP.\n";

    // 5. Final Verification
    $stmtStats->execute([$userId]);
    $finalStats = $stmtStats->fetch();
    $finalPoints = $finalStats['total_points'];
    $finalLevel = $finalStats['current_level'];

    $actualGain = $finalPoints - $initialPoints;

    // Verify Points
    if ($actualGain === $expectedxpGain) {
        echo "  -> [SUCCESS] Phase 1: Points verified ($initialPoints -> $finalPoints).\n";
    }
    else {
        echo "  -> [FAILURE] Phase 1: Point mismatch! Expected +$expectedxpGain, got +$actualGain.\n";
    }

    // Verify Level
    $expectedLevel = floor($finalPoints / 100) + 1;
    if ($finalLevel == $expectedLevel) {
        echo "  -> [SUCCESS] Phase 2: Level verified (Current: $finalLevel, Matches XP calc).\n";
    }
    else {
        echo "  -> [FAILURE] Phase 2: Level mismatch! DB says $finalLevel, XP implies $expectedLevel.\n";
    }
    echo "\n";
}

echo "Operation Complete.\n";
?>