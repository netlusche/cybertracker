<?php
require_once 'api/db.php';
$pdo = getDBConnection();

$categories = ['Hacking', 'Defense', 'Intel', 'Wiring', 'Social', 'Combat', 'Stealth', 'Cryptography', 'Netrunning'];
$priorities = [1, 2, 3];

echo "Starting Massive Task Generation (400 per Level)...\n";
echo "------------------------------------------------\n";

// 1. Get All Users
$stmt = $pdo->query("SELECT id, username FROM users");
$users = $stmt->fetchAll();

foreach ($users as $user) {
    $userId = $user['id'];
    $username = $user['username'];

    echo "Flooding neural interface for: $username ...\n";

    // 2. Create 400 Tasks
    $pdo->beginTransaction();
    $sql = "INSERT INTO tasks (user_id, title, category, priority, points_value, status) VALUES (?, ?, ?, ?, ?, 0)";
    $stmt = $pdo->prepare($sql);

    for ($i = 1; $i <= 400; $i++) {
        $title = "Directive $i-" . bin2hex(random_bytes(2));
        $cat = $categories[array_rand($categories)];
        $prio = $priorities[array_rand($priorities)];
        $points = rand(10, 100);

        $stmt->execute([$userId, $title, $cat, $prio, $points]);
    }
    $pdo->commit();
    echo "  -> [SUCCESS] 400 directives uploaded to cortex.\n";
}

echo "\nOperation Complete. System load normalized.\n";
?>