<?php
// api/repositories/TaskStatusRepository.php
require_once __DIR__ . '/Repository.php';

class TaskStatusRepository extends Repository
{
    public function getUserStatuses(int $userId): array
    {
        $stmt = $this->pdo->prepare("SELECT id, name, is_system, sort_order FROM user_task_statuses WHERE user_id = ? ORDER BY sort_order ASC, id ASC");
        $stmt->execute([$userId]);
        $statuses = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($statuses as &$status) {
            $status['is_system'] = (bool)$status['is_system'];
            $status['sort_order'] = (int)$status['sort_order'];
        }

        return $statuses;
    }

    public function countUserStatuses(int $userId): int
    {
        $check = $this->pdo->prepare("SELECT COUNT(*) FROM user_task_statuses WHERE user_id = ?");
        $check->execute([$userId]);
        return (int)$check->fetchColumn();
    }

    public function getNextSortOrder(int $userId): int
    {
        $stmt = $this->pdo->prepare("SELECT MAX(sort_order) FROM user_task_statuses WHERE user_id = ?");
        $stmt->execute([$userId]);
        $max = $stmt->fetchColumn();
        return $max !== null ? (int)$max + 1 : 1;
    }

    public function createStatus(int $userId, string $name, int $isSystem, int $sortOrder): array
    {
        $stmt = $this->pdo->prepare("INSERT INTO user_task_statuses (user_id, name, is_system, sort_order) VALUES (?, ?, ?, ?)");
        $stmt->execute([$userId, $name, $isSystem, $sortOrder]);
        $id = (int)$this->pdo->lastInsertId();

        return [
            'id' => $id,
            'name' => $name,
            'is_system' => (bool)$isSystem,
            'sort_order' => $sortOrder
        ];
    }

    public function getStatusById(int $statusId, int $userId)
    {
        $stmt = $this->pdo->prepare("SELECT id, name, is_system, sort_order FROM user_task_statuses WHERE id = ? AND user_id = ?");
        $stmt->execute([$statusId, $userId]);
        $status = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($status) {
            $status['is_system'] = (bool)$status['is_system'];
            $status['sort_order'] = (int)$status['sort_order'];
        }

        return $status;
    }

    public function updateStatusName(int $statusId, int $userId, string $oldName, string $newName): void
    {
        $updateStatus = $this->pdo->prepare("UPDATE user_task_statuses SET name = ? WHERE id = ? AND user_id = ?");
        $updateStatus->execute([$newName, $statusId, $userId]);

        // Also update existing tasks that had the old workflow_status
        $updateTasks = $this->pdo->prepare("UPDATE tasks SET workflow_status = ? WHERE workflow_status = ? AND user_id = ?");
        $updateTasks->execute([$newName, $oldName, $userId]);
    }

    public function updateSortOrder(int $statusId, int $userId, int $sortOrder): void
    {
        $stmt = $this->pdo->prepare("UPDATE user_task_statuses SET sort_order = ? WHERE id = ? AND user_id = ?");
        $stmt->execute([$sortOrder, $statusId, $userId]);
    }

    public function deleteStatus(int $statusId, int $userId): bool
    {
        $stmt = $this->pdo->prepare("DELETE FROM user_task_statuses WHERE id = ? AND user_id = ?");
        $stmt->execute([$statusId, $userId]);
        return $stmt->rowCount() > 0;
    }
}