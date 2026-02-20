<?php
// api/repositories/TaskRepository.php
require_once __DIR__ . '/Repository.php';

class TaskRepository extends Repository
{
    private function buildWhereParams(int $userId, string $search, ?int $priority, ?string $category, bool $overdue): array
    {
        $where = ["user_id = ?"];
        $params = [$userId];

        if ($search) {
            $where[] = "title LIKE ?";
            $params[] = "%$search%";
        }
        if ($priority !== null) {
            $where[] = "priority = ?";
            $params[] = $priority;
        }
        if ($category !== null) {
            $where[] = "category = ?";
            $params[] = $category;
        }
        if ($overdue) {
            $where[] = "status = 0 AND due_date < ? AND due_date IS NOT NULL";
            $params[] = date('Y-m-d');
        }

        return ['where' => implode(' AND ', $where), 'params' => $params];
    }

    public function countFilteredTasks(int $userId, string $search, ?int $priority, ?string $category, bool $overdue): int
    {
        $build = $this->buildWhereParams($userId, $search, $priority, $category, $overdue);
        $whereSql = $build['where'];
        $params = $build['params'];

        $countSql = "SELECT COUNT(*) as total FROM tasks WHERE $whereSql";
        $stmt = $this->pdo->prepare($countSql);
        $stmt->execute($params);
        return (int)$stmt->fetchColumn();
    }

    public function getFilteredTasks(int $userId, string $search, ?int $priority, ?string $category, bool $overdue, int $limit, int $offset): array
    {
        $build = $this->buildWhereParams($userId, $search, $priority, $category, $overdue);
        $whereSql = $build['where'];
        $params = $build['params'];

        $today = date('Y-m-d');
        $sql = "SELECT * FROM tasks WHERE $whereSql 
                ORDER BY 
                status ASC,
                CASE 
                    WHEN status = 0 AND due_date < ? THEN 0
                    WHEN status = 0 AND due_date = ? THEN 1
                    ELSE 2
                END ASC,
                priority ASC,
                CASE WHEN status = 0 THEN due_date END ASC,
                CASE WHEN status = 1 THEN due_date END DESC,
                created_at DESC
                LIMIT ? OFFSET ?";

        $stmt = $this->pdo->prepare($sql);

        $paramIdx = 1;
        foreach ($params as $val) {
            $stmt->bindValue($paramIdx++, $val);
        }

        $stmt->bindValue($paramIdx++, $today);
        $stmt->bindValue($paramIdx++, $today);
        $stmt->bindValue($paramIdx++, $limit, PDO::PARAM_INT);
        $stmt->bindValue($paramIdx++, $offset, PDO::PARAM_INT);

        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getTaskById(int $taskId, int $userId)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM tasks WHERE id = ? AND user_id = ?");
        $stmt->execute([$taskId, $userId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createTask(int $userId, string $title, string $category, int $priority, int $points, ?string $dueDate): int
    {
        $sql = "INSERT INTO tasks (user_id, title, category, priority, points_value, due_date) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$userId, $title, $category, $priority, $points, $dueDate]);
        return (int)$this->pdo->lastInsertId();
    }

    public function updateTaskFields(int $taskId, array $fields, array $params): void
    {
        if (empty($fields)) {
            return;
        }
        $sql = "UPDATE tasks SET " . implode(', ', $fields) . " WHERE id = ?";
        $params[] = $taskId;

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
    }

    public function deleteTask(int $taskId, int $userId): void
    {
        $stmt = $this->pdo->prepare("DELETE FROM tasks WHERE id = ? AND user_id = ?");
        $stmt->execute([$taskId, $userId]);
    }
}