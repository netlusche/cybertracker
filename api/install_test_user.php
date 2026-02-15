<?php
// api/install_test_user.php
// Creates a test user 'Alicia' with 250 tasks for testing purposes.
// Works with SQLite, MySQL, and MariaDB.
// SECURITY WARNING: Remove this file after installation/testing!

require_once 'db.php';

header('Content-Type: text/plain');

try {
    $pdo = getDBConnection();
}
catch (Exception $e) {
    die("Database connection failed: " . $e->getMessage());
}

$username = 'Alicia';
$password = 'password';

echo "--- CYBER TASKER TEST DATA INSTALLER ---\n";
echo "Target User: $username\n";

// 1. Create or Reset User
// Check if exists
$stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
$stmt->execute([$username]);
$user = $stmt->fetch();

if ($user) {
    $userId = $user['id'];
    echo "User found (ID: $userId). clearing existing tasks...\n";
    $pdo->prepare("DELETE FROM tasks WHERE user_id = ?")->execute([$userId]);
    // Reset stats
    $pdo->prepare("UPDATE user_stats SET total_points = 0, current_level = 1 WHERE id = ?")->execute([$userId]);
}
else {
    echo "Creating new user...\n";
    $hashed = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO users (username, password, role, is_verified) VALUES (?, ?, 'user', 1)");
    $stmt->execute([$username, $hashed]);
    $userId = $pdo->lastInsertId();
    echo "User created with ID: $userId\n";

    // Initialize Stats
    $pdo->prepare("INSERT INTO user_stats (id, total_points, current_level, badges_json) VALUES (?, 0, 1, '[]')")->execute([$userId]);

    // Seed Default Categories
    $defaultCategories = [
        ['name' => 'Work', 'is_default' => 0],
        ['name' => 'Personal', 'is_default' => 0],
        ['name' => 'Urgent', 'is_default' => 1],
        ['name' => 'Hobby', 'is_default' => 0]
    ];
    foreach ($defaultCategories as $cat) {
        // Ignore errors if category already exists (SQLite INSERT OR IGNORE syntax varies, so we catch exception or just let it fail silently if constraints hit)
        // Better: Check first
        $check = $pdo->prepare("SELECT id FROM user_categories WHERE user_id = ? AND name = ?");
        $check->execute([$userId, $cat['name']]);
        if (!$check->fetch()) {
            $stmt = $pdo->prepare("INSERT INTO user_categories (user_id, name, is_default) VALUES (?, ?, ?)");
            $stmt->execute([$userId, $cat['name'], $cat['is_default']]);
        }
    }
}

// Fetch categories for this user
$stmt = $pdo->prepare("SELECT name FROM user_categories WHERE user_id = ?");
$stmt->execute([$userId]);
$categories = $stmt->fetchAll(PDO::FETCH_COLUMN);

if (empty($categories)) {
    die("Error: No categories available for user. Setup failed.\n");
}

// 2. Generate Tasks (DB Agnostic Logic)
echo "Generating 250 Cyberpunk tasks...\n";

$verbs = ["Hack", "Encrypt", "Decrypt", "Override", "Bypass", "Infiltrate", "Debug", "Patch", "Upload", "Download", "Trace", "Signal", "Reboot", "Synthesize", "Upgrade"];
$nouns = ["Mainframe", "Neural Link", "Cyberdeck", "Firewall", "AI Core", "Bio-Chip", "Subnet", "Protocol", "Algorithm", "Proxy", "Drone", "Exoskeleton", "Neon Lights", "Database", "Memory Bank"];
$adjectives = ["Corrupted", "Encrypted", "Quantum", "Hidden", "Rogue", "Forbidden", "Unauthorized", "Virtual", "Holographic", "Obsolete", "High-Tech"];

$count = 0;
$pdo->beginTransaction();

try {
    for ($i = 0; $i < 250; $i++) {
        $verb = $verbs[array_rand($verbs)];
        $noun = $nouns[array_rand($nouns)];
        $adj = $adjectives[array_rand($adjectives)];

        $title = "$verb the $adj $noun";
        $priority = rand(1, 3);
        $catName = $categories[array_rand($categories)];
        $isDone = (rand(0, 100) < 20) ? 1 : 0; // 20% chance of being done

        // Random date: +/- 30 days from now
        $daysOffset = rand(-30, 30);
        $dueDate = date('Y-m-d', strtotime("$daysOffset days"));

        // Using points_value default 10
        // Note: 'category' column stores String Name, 'category_id' does not exist in tasks table
        $stmt = $pdo->prepare("INSERT INTO tasks (user_id, title, category, priority, due_date, status, points_value) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$userId, $title, $catName, $priority, $dueDate, $isDone, 10]);
        $count++;
    }
    $pdo->commit();
    echo "Successfully created $count tasks.\n";

    // 3. Update Stats (XP & Level)
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM tasks WHERE user_id = ? AND status = 1");
    $stmt->execute([$userId]);
    $completedCount = $stmt->fetchColumn();

    $totalPoints = $completedCount * 10; // 10 XP per task
    $level = floor($totalPoints / 100) + 1;

    $stmt = $pdo->prepare("UPDATE user_stats SET total_points = ?, current_level = ? WHERE id = ?");
    $stmt->execute([$totalPoints, $level, $userId]);

    echo "Stats updated: Level $level, $totalPoints XP ($completedCount completed tasks).\n";
    echo "---------------------------------------------------\n";
    echo "LOGIN CREDENTIALS:\n";
    echo "Username: $username\n";
    echo "Password: $password\n";
    echo "---------------------------------------------------\n";
    echo "IMPORTANT: Delete this file (api/install_test_user.php) after use!\n";

}
catch (Exception $e) {
    $pdo->rollBack();
    echo "Failed to insert tasks: " . $e->getMessage() . "\n";
}
?>