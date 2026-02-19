<?php
/**
 * generate_test_data.php
 * Utility for populating CyberTasker with bulk test data.
 */

if (php_sapi_name() !== 'cli') {
    die("This script must be run from the command line.\n");
}

$opts = getopt("", ["mode:", "user:"]);
$mode = $opts['mode'] ?? 'help';
$targetUser = $opts['user'] ?? 'tester_operative';

require_once __DIR__ . '/../../api/db.php';
$pdo = getDBConnection();

// Get User ID
$stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
$stmt->execute([$targetUser]);
$uid = $stmt->fetchColumn();

if (!$uid && !in_array($mode, ['admin', 'cleanup', 'help'])) {
    die("Error: User '$targetUser' not found.\n");
}

switch ($mode) {
    case 'pagination':
        echo "Generating 250 random directives for $targetUser...\n";
        $stmt = $pdo->prepare("INSERT INTO tasks (user_id, title, category, priority, status, points_value, due_date) VALUES (?, ?, ?, ?, 0, 10, ?)");
        $categories = ['Work', 'Private', 'Health', 'Finance', 'Hobby'];
        for ($i = 1; $i <= 250; $i++) {
            $title = "Directive " . bin2hex(random_bytes(4));
            $cat = $categories[array_rand($categories)];
            $prio = rand(1, 3);
            $due = date('Y-m-d', strtotime('+' . rand(1, 30) . ' days'));
            $stmt->execute([$uid, $title, $cat, $prio, $due]);
        }
        echo "Success: 250 directives created.\n";
        break;

    case 'admin':
        echo "Generating 40 dummy users...\n";
        $stmtUser = $pdo->prepare("INSERT INTO users (username, password, role, is_verified) VALUES (?, ?, 'user', 1)");
        $stmtStats = $pdo->prepare("INSERT INTO user_stats (id, total_points, current_level, badges_json) VALUES (?, 0, 1, '[]')");
        $passHash = password_hash('password', PASSWORD_DEFAULT);

        for ($i = 1; $i <= 40; $i++) {
            $username = "dummy_recruit_" . str_pad($i, 2, '0', STR_PAD_LEFT);
            try {
                $stmtUser->execute([$username, $passHash]);
                $newId = $pdo->lastInsertId();
                $stmtStats->execute([$newId]);
            }
            catch (Exception $e) {
                echo "Skipping $username (already exists?)\n";
            }
        }
        echo "Success: Dummy fleet established.\n";
        break;

    case 'levelup':
        echo "Generating 10 HIGH priority directives for $targetUser (Level-Up Test)...\n";
        $stmt = $pdo->prepare("INSERT INTO tasks (user_id, title, category, priority, status, points_value) VALUES (?, ?, 'Work', 1, 0, 50)");
        for ($i = 1; $i <= 10; $i++) {
            $stmt->execute([$uid, "High Prio Protocol " . $i]);
        }
        echo "Success: 10 HIGH prio directives created. Completion will yield 500 XP.\n";
        break;

    case 'cleanup':
        echo "Cleaning up test data...\n";
        // Delete dummy users
        $pdo->exec("DELETE FROM users WHERE username LIKE 'dummy_recruit_%'");
        // Delete tasks for dummy recruits (cascaded in DB but let's be safe)
        $pdo->exec("DELETE FROM tasks WHERE user_id NOT IN (SELECT id FROM users)");
        // Delete user_stats for deleted users
        $pdo->exec("DELETE FROM user_stats WHERE id NOT IN (SELECT id FROM users)");
        echo "Success: System purged of test anomalies.\n";
        break;

    case 'help':
    default:
        echo "CyberTasker Data Generator\n";
        echo "Usage: php generate_test_data.php --mode [pagination|admin|levelup|cleanup] [--user username]\n";
        break;
}