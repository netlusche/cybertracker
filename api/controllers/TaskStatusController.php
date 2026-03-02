<?php
// api/controllers/TaskStatusController.php

class TaskStatusController extends Controller
{
    public function index()
    {
        $this->requireAuth();
        $statuses = $this->taskStatusRepo->getUserStatuses($this->userId);
        $this->jsonResponse($statuses);
    }

    public function store()
    {
        $this->requireAuth();
        $data = $this->getJsonBody();

        if (!isset($data['name']) || empty(trim($data['name']))) {
            $this->errorResponse('Status name required');
        }

        $name = trim($data['name']);

        // Check if status name already exists to prevent weird duplicate states
        $existing = $this->taskStatusRepo->getUserStatuses($this->userId);
        foreach ($existing as $existingStatus) {
            if (strtolower(trim($existingStatus['name'])) === strtolower($name)) {
                $this->errorResponse('Status name already exists', 409);
            }
        }

        try {
            // Get the current sort_order of 'completed'
            $stmt = $this->pdo->prepare("SELECT id, sort_order FROM user_task_statuses WHERE user_id = ? AND name = 'completed'");
            $stmt->execute([$this->userId]);
            $completedStatus = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($completedStatus) {
                $completedOrder = (int)$completedStatus['sort_order'];
                // Shift 'completed' (and anything weirdly after it) down by 1
                $shiftStmt = $this->pdo->prepare("UPDATE user_task_statuses SET sort_order = sort_order + 1 WHERE user_id = ? AND sort_order >= ?");
                $shiftStmt->execute([$this->userId, $completedOrder]);

                // Insert new status at the old 'completed' position
                $newSortOrder = $completedOrder;
            }
            else {
                // Fallback
                $newSortOrder = $this->taskStatusRepo->getNextSortOrder($this->userId);
            }

            // New statuses created by the user are never system statuses
            $result = $this->taskStatusRepo->createStatus($this->userId, $name, 0, $newSortOrder);
            $result['message'] = 'Status added';

            $this->jsonResponse($result);
        }
        catch (PDOException $e) {
            $this->errorResponse('Database error creating status', 500);
        }
    }

    public function update()
    {
        $this->requireAuth();
        $data = $this->getJsonBody();

        if (!isset($data['id'])) {
            $this->errorResponse('ID required');
        }

        $statusId = $data['id'];

        try {
            $oldStatus = $this->taskStatusRepo->getStatusById($statusId, $this->userId);

            if (!$oldStatus) {
                throw new Exception("Status not found");
            }

            // You cannot modify system statuses (Like "open" and "completed")
            // Actually, we could allow renaming them for localization purposes, 
            // but the business logic expects them to be "open" and "completed", 
            // so renaming them is dangerous.
            // Let's rely on translation keys for display, and keep the DB name untouched for system statuses.
            if ($oldStatus['is_system'] && isset($data['name']) && trim($data['name']) !== $oldStatus['name']) {
                $this->errorResponse('System statuses cannot be renamed. They are translated by the UI.', 403);
            }

            $this->taskStatusRepo->beginTransaction();

            if (isset($data['name']) && !empty(trim($data['name'])) && !$oldStatus['is_system']) {
                $newName = trim($data['name']);
                if ($newName !== $oldStatus['name']) {
                    // Check duplicate
                    $existing = $this->taskStatusRepo->getUserStatuses($this->userId);
                    foreach ($existing as $existingStatus) {
                        if ($existingStatus['id'] != $statusId && strtolower(trim($existingStatus['name'])) === strtolower($newName)) {
                            $this->taskStatusRepo->rollBack();
                            $this->errorResponse('Status name already exists', 409);
                            return;
                        }
                    }
                    $this->taskStatusRepo->updateStatusName($statusId, $this->userId, $oldStatus['name'], $newName);
                }
            }

            if (isset($data['sort_order'])) {
                $this->taskStatusRepo->updateSortOrder($statusId, $this->userId, (int)$data['sort_order']);
            }

            $this->taskStatusRepo->commit();
            $this->jsonResponse(['message' => 'Status updated']);

        }
        catch (Exception $e) {
            if ($this->taskStatusRepo->inTransaction()) {
                $this->taskStatusRepo->rollBack();
            }
            if ($e->getMessage() === 'Status not found') {
                $this->errorResponse('Status not found', 404);
            }
            else {
                error_log("Status rename error: " . $e->getMessage());
                $this->errorResponse('Database transaction failed', 500);
            }
        }
    }

    public function reorder()
    {
        $this->requireAuth();
        $data = $this->getJsonBody();

        if (!isset($data['order']) || !is_array($data['order'])) {
            $this->errorResponse('Order array required');
        }

        try {
            $this->taskStatusRepo->beginTransaction();

            foreach ($data['order'] as $item) {
                if (isset($item['id']) && isset($item['sort_order'])) {
                    // Update sort order for each status
                    $this->taskStatusRepo->updateSortOrder((int)$item['id'], $this->userId, (int)$item['sort_order']);
                }
            }

            $this->taskStatusRepo->commit();
            $this->jsonResponse(['message' => 'Statuses reordered successfully']);
        }
        catch (Exception $e) {
            if ($this->taskStatusRepo->inTransaction()) {
                $this->taskStatusRepo->rollBack();
            }
            $this->errorResponse('Failed to reorder statuses', 500);
        }
    }


    public function destroy()
    {
        $this->requireAuth();

        if (!isset($_GET['id'])) {
            $this->errorResponse('ID required');
        }

        $statusId = $_GET['id'];

        try {
            $status = $this->taskStatusRepo->getStatusById($statusId, $this->userId);

            if (!$status) {
                $this->errorResponse('Status not found', 404);
            }

            if ($status['is_system']) {
                $this->errorResponse('System statuses cannot be deleted', 403);
            }

            // Reassign tasks that have this status back to 'open'
            $updateTasks = $this->pdo->prepare("UPDATE tasks SET workflow_status = 'open' WHERE workflow_status = ? AND user_id = ?");
            $updateTasks->execute([$status['name'], $this->userId]);

            $deleted = $this->taskStatusRepo->deleteStatus($statusId, $this->userId);

            if ($deleted) {
                $this->jsonResponse(['message' => 'Status deleted']);
            }
            else {
                $this->errorResponse('Failed to delete status', 500);
            }
        }
        catch (PDOException $e) {
            $this->errorResponse('Failed to delete status', 500);
        }
    }
}