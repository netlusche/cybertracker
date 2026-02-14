<?php
// tasks.php
require_once 'db.php';
session_start();

header("Content-Type: application/json");

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$userId = $_SESSION['user_id'];
$pdo = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
        $offset = ($page - 1) * $limit;

        // Get Total Count
        $countSql = "SELECT COUNT(*) as total FROM tasks WHERE user_id = ?";
        $stmt = $pdo->prepare($countSql);
        $stmt->execute([$userId]);
        $totalParam = $stmt->fetch()['total'];

        // Get Paginated Data
        // Sorting: 1. Due Date (ASC), 2. Priority (ASC - High to Low), 3. Created At (DESC - Newest)
        $sql = "SELECT * FROM tasks WHERE user_id = ? 
                ORDER BY 
                CASE WHEN due_date IS NOT NULL THEN 0 ELSE 1 END ASC,
                due_date ASC,
                priority ASC,
                created_at DESC
                LIMIT ? OFFSET ?";
        $stmt = $pdo->prepare($sql);
        // Bind params explicitly because LIMIT/OFFSET need integers, and execute array treats all as strings sometimes
        $stmt->bindParam(1, $userId, PDO::PARAM_INT);
        $stmt->bindParam(2, $limit, PDO::PARAM_INT);
        $stmt->bindParam(3, $offset, PDO::PARAM_INT);
        $stmt->execute();
        $tasks = $stmt->fetchAll();

        echo json_encode([
            'data' => $tasks,
            'meta' => [
                'current_page' => $page,
                'limit' => $limit,
                'total_tasks' => $totalParam,
                'total_pages' => ceil($totalParam / $limit)
            ]
        ]);
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['title'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Title is required']);
            exit();
        }

        $title = $data['title'];
        $category = $data['category'] ?? 'General';
        $priority = $data['priority'] ?? 2;
        $points = $data['points_value'] ?? 10;
        $dueDate = !empty($data['due_date']) ? $data['due_date'] : null;

        $sql = "INSERT INTO tasks (user_id, title, category, priority, points_value, due_date) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$userId, $title, $category, $priority, $points, $dueDate]);

        echo json_encode(['id' => $pdo->lastInsertId(), 'message' => 'Task created']);
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'ID is required']);
            exit();
        }

        $id = $data['id'];

        // Ensure task belongs to user
        $check = $pdo->prepare("SELECT id FROM tasks WHERE id = ? AND user_id = ?");
        $check->execute([$id, $userId]);
        if (!$check->fetch()) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            exit;
        }

        // ... (Same update logic as before) ...
        $fields = [];
        $params = [];

        if (isset($data['status'])) {
            $fields[] = 'status = ?';
            $params[] = $data['status'];

            if ($data['status'] == 1) {
                $stmt = $pdo->prepare("SELECT points_value FROM tasks WHERE id = ?");
                $stmt->execute([$id]);
                $task = $stmt->fetch();
                if ($task) {
                    $pointsObj = $task['points_value'];
                    // Update current user stats
                    $sqlUser = "UPDATE user_stats SET total_points = total_points + ? WHERE id = ?";
                    $stmtUser = $pdo->prepare($sqlUser);
                    $stmtUser->execute([$pointsObj, $userId]);
                }
            }
        }
        if (isset($data['title'])) {
            $fields[] = 'title = ?';
            $params[] = $data['title'];
        }
        if (isset($data['category'])) {
            $fields[] = 'category = ?';
            $params[] = $data['category'];
        }
        if (isset($data['priority'])) {
            $priority = (int)$data['priority'];
            $fields[] = 'priority = ?';
            $params[] = $priority;

            // Recalculate points based on new priority
            // Logic: 1(High)=20, 2(Med)=15, 3(Low)=10
            $pointsValue = 10 + (3 - $priority) * 5;
            $fields[] = 'points_value = ?';
            $params[] = $pointsValue;
        }
        if (array_key_exists('due_date', $data)) {
            $fields[] = 'due_date = ?';
            $params[] = !empty($data['due_date']) ? $data['due_date'] : null;
        }

        if (empty($fields)) {
            echo json_encode(['message' => 'No changes']);
            exit();
        }

        $sql = "UPDATE tasks SET " . implode(', ', $fields) . " WHERE id = ?";
        $params[] = $id;

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        echo json_encode(['message' => 'Task updated']);
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if (!$id) {
            exit();
        }

        $sql = "DELETE FROM tasks WHERE id = ? AND user_id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$id, $userId]);

        echo json_encode(['message' => 'Task deleted']);
        break;
}
?>