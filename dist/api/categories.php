<?php
require_once 'db.php';

// 1. Authenticate
session_start();
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}
$userId = $_SESSION['user_id'];

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDBConnection();

// Helper: Seed defaults if none exist
function seedDefaultCategories($pdo, $userId)
{
    $defaults = [
        ['name' => 'Private', 'is_default' => 1],
        ['name' => 'Work', 'is_default' => 0],
        ['name' => 'Health', 'is_default' => 0],
        ['name' => 'Finance', 'is_default' => 0],
        ['name' => 'Hobby', 'is_default' => 0]
    ];

    // Better approach independent of DB type:
    $check = $pdo->prepare("SELECT COUNT(*) FROM user_categories WHERE user_id = ?");
    $check->execute([$userId]);
    if ($check->fetchColumn() == 0) {
        $insert = $pdo->prepare("INSERT INTO user_categories (user_id, name, is_default) VALUES (?, ?, ?)");
        foreach ($defaults as $cat) {
            try {
                $insert->execute([$userId, $cat['name'], $cat['is_default']]);
            }
            catch (PDOException $e) {
            // Ignore duplicates if they somehow exist
            }
        }
    }
}

// GET: Fetch Categories
if ($method === 'GET') {
    seedDefaultCategories($pdo, $userId);

    $stmt = $pdo->prepare("SELECT id, name, is_default FROM user_categories WHERE user_id = ? ORDER BY is_default DESC, name ASC");
    $stmt->execute([$userId]);
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Convert is_default to boolean for frontend convenience
    foreach ($categories as &$cat) {
        $cat['is_default'] = (bool)$cat['is_default'];
    }

    echo json_encode($categories);
    exit;
}

// POST: Add Category or Set Default
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    // Action: Set Default
    if (isset($_GET['action']) && $_GET['action'] === 'set_default') {
        if (!isset($data['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'ID required']);
            exit;
        }

        $newDefaultId = $data['id'];

        try {
            $pdo->beginTransaction();

            // 1. Reset all defaults for user
            $reset = $pdo->prepare("UPDATE user_categories SET is_default = 0 WHERE user_id = ?");
            $reset->execute([$userId]);

            // 2. Set new default
            $set = $pdo->prepare("UPDATE user_categories SET is_default = 1 WHERE id = ? AND user_id = ?");
            $set->execute([$newDefaultId, $userId]);

            $pdo->commit();
            echo json_encode(['message' => 'Default category updated']);
        }
        catch (PDOException $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['error' => 'Failed to set default']);
        }
        exit;
    }

    // Action: Add Category (Standard POST)
    if (!isset($data['name']) || empty(trim($data['name']))) {
        http_response_code(400);
        echo json_encode(['error' => 'Category name required']);
        exit;
    }

    $name = trim($data['name']);

    try {
        // Check if it's the first category (make it default)
        $check = $pdo->prepare("SELECT COUNT(*) FROM user_categories WHERE user_id = ?");
        $check->execute([$userId]);
        $isFirst = $check->fetchColumn() == 0;
        $isDefault = $isFirst ? 1 : 0;

        $stmt = $pdo->prepare("INSERT INTO user_categories (user_id, name, is_default) VALUES (?, ?, ?)");
        $stmt->execute([$userId, $name, $isDefault]);
        echo json_encode(['id' => $pdo->lastInsertId(), 'name' => $name, 'is_default' => (bool)$isDefault, 'message' => 'Category added']);
    }
    catch (PDOException $e) {
        http_response_code(409); // Conflict
        echo json_encode(['error' => 'Category likely already exists']);
    }
    exit;
}

// PUT: Rename Category
if ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['id']) || !isset($data['name']) || empty(trim($data['name']))) {
        http_response_code(400);
        echo json_encode(['error' => 'ID and new name required']);
        exit;
    }

    $catId = $data['id'];
    $newName = trim($data['name']);

    try {
        $pdo->beginTransaction();

        // 1. Get old name
        $stmt = $pdo->prepare("SELECT name FROM user_categories WHERE id = ? AND user_id = ?");
        $stmt->execute([$catId, $userId]);
        $oldCat = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$oldCat) {
            throw new Exception("Category not found");
        }
        $oldName = $oldCat['name'];

        // 2. Update Category Name
        $updateCat = $pdo->prepare("UPDATE user_categories SET name = ? WHERE id = ? AND user_id = ?");
        $updateCat->execute([$newName, $catId, $userId]);

        // 3. Update Existing Tasks
        $updateTasks = $pdo->prepare("UPDATE tasks SET category = ? WHERE category = ? AND user_id = ?");
        $updateTasks->execute([$newName, $oldName, $userId]);

        $pdo->commit();
        echo json_encode(['message' => 'Category renamed and tasks updated']);

    }
    catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

// DELETE: Remove Category
if ($method === 'DELETE') {
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'ID required']);
        exit;
    }

    $catId = $_GET['id'];

    try {
        // [Safety] Check if it's the default category
        $check = $pdo->prepare("SELECT is_default FROM user_categories WHERE id = ? AND user_id = ?");
        $check->execute([$catId, $userId]);
        $cat = $check->fetch();

        if ($cat && $cat['is_default']) {
            // Find another one to promote
            $other = $pdo->prepare("SELECT id FROM user_categories WHERE user_id = ? AND id != ? LIMIT 1");
            $other->execute([$userId, $catId]);
            $next = $other->fetch();
            if ($next) {
                $pdo->prepare("UPDATE user_categories SET is_default = 1 WHERE id = ?")->execute([$next['id']]);
            }
            else {
                // If it's the last category, we let it be deleted and next GET will seed defaults.
                // Or we can block it. Let's block it for better UX.
                http_response_code(400);
                echo json_encode(['error' => 'Cannot delete the only available category']);
                exit;
            }
        }

        $stmt = $pdo->prepare("DELETE FROM user_categories WHERE id = ? AND user_id = ?");
        $stmt->execute([$catId, $userId]);

        if ($stmt->rowCount() > 0) {
            echo json_encode(['message' => 'Category deleted']);
        }
        else {
            http_response_code(404);
            echo json_encode(['error' => 'Category not found or access denied']);
        }
    }
    catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete category']);
    }
    exit;
}