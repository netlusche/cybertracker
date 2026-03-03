<?php
// api/repositories/TaskRepository.php
require_once __DIR__ . '/Repository.php';

class TaskRepository extends Repository
{
    private function buildWhereParams(int $userId, string $search, ?int $priority, ?string $category, bool $overdue, bool $completed): array
    {
        $where = ["user_id = ?"];
        $params = [$userId];

        if ($completed) {
            $where[] = "status = 1";
        }

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
            $where[] = "due_date < ? AND due_date IS NOT NULL";
            $params[] = date('Y-m-d');
        }

        return ['where' => implode(' AND ', $where), 'params' => $params];
    }

    public function countFilteredTasks(int $userId, string $search, ?int $priority, ?string $category, bool $overdue, bool $completed): int
    {
        $build = $this->buildWhereParams($userId, $search, $priority, $category, $overdue, $completed);
        $whereSql = $build['where'];
        $params = $build['params'];

        $countSql = "SELECT COUNT(*) as total FROM tasks WHERE $whereSql";
        $stmt = $this->pdo->prepare($countSql);
        $stmt->execute($params);
        return (int)$stmt->fetchColumn();
    }

    public function getFilteredTasks(int $userId, string $search, ?int $priority, ?string $category, bool $overdue, bool $completed, int $limit, int $offset): array
    {
        $build = $this->buildWhereParams($userId, $search, $priority, $category, $overdue, $completed);
        $whereSql = $build['where'];
        $params = $build['params'];

        $today = date('Y-m-d');
        $sql = "SELECT tasks.*, (SELECT COUNT(*) FROM task_notes WHERE task_notes.task_id = tasks.id) as notes_count FROM tasks WHERE $whereSql 
                ORDER BY 
                status ASC,
                CASE 
                    WHEN status = 0 AND due_date IS NOT NULL AND due_date != '' AND DATE(due_date) < ? THEN 0
                    WHEN status = 0 AND due_date IS NOT NULL AND due_date != '' AND DATE(due_date) = ? THEN 1
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

    public function getCalendarTasks(int $userId): array
    {
        // Fetch all active calendar tasks, including those with recurrence
        $sql = "SELECT tasks.id, tasks.title, tasks.due_date, tasks.status, tasks.priority, tasks.category, tasks.points_value, tasks.description, tasks.recurrence_interval, tasks.recurrence_end_date, (SELECT COUNT(*) FROM task_notes WHERE task_notes.task_id = tasks.id) as notes_count FROM tasks WHERE user_id = ? AND status = 0 AND due_date IS NOT NULL ORDER BY due_date ASC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$userId]);
        $baseTasks = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $calendarTasks = [];

        foreach ($baseTasks as $task) {
            // Include the real task
            $task['is_projection'] = false;
            $calendarTasks[] = $task;

            // Generate Holo-Projections if it is a recurring task
            if (!empty($task['recurrence_interval']) && $task['recurrence_interval'] !== 'None') {
                $calendarTasks = array_merge($calendarTasks, $this->generateProjections($task));
            }
        }

        // Re-sort the combined array by date
        usort($calendarTasks, function ($a, $b) {
            return strtotime($a['due_date']) - strtotime($b['due_date']);
        });

        return $calendarTasks;
    }

    private function generateProjections(array $task): array
    {
        $projections = [];
        $interval = strtolower($task['recurrence_interval'] ?? '');
        $currentDateStr = $task['due_date'];

        $endDateObj = !empty($task['recurrence_end_date']) ? new DateTime($task['recurrence_end_date']) : null;
        if ($endDateObj) {
            $endDateObj->setTime(23, 59, 59); // End of day
        }

        $modifier = '';
        $limit = 0;

        switch ($interval) {
            case 'daily':
                $modifier = '+1 day';
                $limit = $endDateObj ? 365 : 60; // 1 year if bounded, 2 months if infinite
                break;
            case 'weekly':
                $modifier = '+1 week';
                $limit = $endDateObj ? 104 : 26; // 2 years if bounded, half year if infinite
                break;
            case 'monthly':
                $modifier = '+1 month';
                $limit = $endDateObj ? 60 : 12; // 5 years if bounded, 1 year if infinite
                break;
            case 'yearly':
                $modifier = '+1 year';
                $limit = $endDateObj ? 10 : 5; // 10 years if bounded, 5 years if infinite
                break;
            default:
                return [];
        }

        for ($i = 0; $i < $limit; $i++) {
            $currentDateStr = date('Y-m-d H:i:s', strtotime($currentDateStr . ' ' . $modifier));

            // Abort if projection goes past the configured end date
            if ($endDateObj && new DateTime($currentDateStr) > $endDateObj) {
                break;
            }

            $projection = $task;
            $projection['id'] = 'holo_' . $task['id'] . '_' . $i; // Virtual ID
            $projection['due_date'] = $currentDateStr;
            $projection['is_projection'] = true;

            $projections[] = $projection;
        }

        return $projections;
    }

    public function getTaskById(int $taskId, int $userId)
    {
        $stmt = $this->pdo->prepare("SELECT tasks.*, (SELECT COUNT(*) FROM task_notes WHERE task_notes.task_id = tasks.id) as notes_count FROM tasks WHERE id = ? AND user_id = ?");
        $stmt->execute([$taskId, $userId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createTask(int $userId, string $title, string $category, int $priority, int $points, ?string $dueDate, ?string $description = null, ?string $attachments = null, ?string $files = null, ?string $subroutinesJson = null, ?string $recurrenceInterval = null, ?string $recurrenceEndDate = null): int
    {
        $sql = "INSERT INTO tasks (user_id, title, category, priority, points_value, due_date, description, attachments, files, subroutines_json, recurrence_interval, recurrence_end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$userId, $title, $category, $priority, $points, $dueDate, $description, $attachments, $files, $subroutinesJson, $recurrenceInterval, $recurrenceEndDate]);
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

    public function deleteCompletedTasks(int $userId): int
    {
        $stmt = $this->pdo->prepare("DELETE FROM tasks WHERE user_id = ? AND status = 1");
        $stmt->execute([$userId]);
        return $stmt->rowCount();
    }

    public function deleteMultipleTasks(array $taskIds, int $userId): int
    {
        if (empty($taskIds)) {
            return 0;
        }

        $placeholders = rtrim(str_repeat('?,', count($taskIds)), ',');
        $sql = "DELETE FROM tasks WHERE id IN ($placeholders) AND user_id = ?";

        $params = $taskIds;
        $params[] = $userId;

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->rowCount();
    }

    public function checkIfUserHasCompletedTasks(int $userId): bool
    {
        $stmt = $this->pdo->prepare("SELECT 1 FROM tasks WHERE user_id = ? AND status = 1 LIMIT 1");
        $stmt->execute([$userId]);
        return (bool)$stmt->fetchColumn();
    }
}