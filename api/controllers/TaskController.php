<?php
// api/controllers/TaskController.php

class TaskController extends Controller
{
    public function index()
    {
        $this->requireAuth();

        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
        $offset = ($page - 1) * $limit;

        $search = $_GET['search'] ?? '';
        $priority = isset($_GET['priority']) && $_GET['priority'] !== '' ? (int)$_GET['priority'] : null;
        $category = isset($_GET['category']) && $_GET['category'] !== '' ? $_GET['category'] : null;
        $overdue = isset($_GET['overdue']) && $_GET['overdue'] === 'true';

        $totalParam = $this->taskRepo->countFilteredTasks($this->userId, $search, $priority, $category, $overdue);
        $tasks = $this->taskRepo->getFilteredTasks($this->userId, $search, $priority, $category, $overdue, $limit, $offset);

        $this->jsonResponse([
            'data' => $tasks,
            'meta' => [
                'current_page' => $page,
                'limit' => $limit,
                'total_tasks' => $totalParam,
                'total_pages' => $limit > 0 ? ceil($totalParam / $limit) : 1
            ]
        ]);
    }

    public function store()
    {
        $this->requireAuth();
        $data = $this->getJsonBody();

        $title = trim($data['title'] ?? '');
        if (empty($title)) {
            $this->errorResponse('Title is required');
        }
        if (strlen($title) > 255) {
            $this->errorResponse('Title exceeds maximum length of 255 characters');
        }

        $category = $data['category'] ?? 'General';
        $priority = $data['priority'] ?? 2;
        $points = $data['points_value'] ?? 10;
        $dueDate = !empty($data['due_date']) ? $data['due_date'] : null;

        $taskId = $this->taskRepo->createTask($this->userId, $title, $category, $priority, $points, $dueDate);

        $this->jsonResponse(['id' => $taskId, 'message' => 'Task created']);
    }

    public function update()
    {
        $this->requireAuth();
        $data = $this->getJsonBody();
        if (!isset($data['id'])) {
            $this->errorResponse('ID is required');
        }

        $id = $data['id'];

        $task = $this->taskRepo->getTaskById($id, $this->userId);
        if (!$task) {
            $this->errorResponse('Forbidden', 403);
        }

        $fields = [];
        $params = [];

        if (isset($data['status'])) {
            $fields[] = 'status = ?';
            $params[] = $data['status'];

            if ($data['status'] == 1) {
                // Self healing user stats
                $stats = $this->userRepo->getStats($this->userId);

                if (!$stats) {
                    $this->userRepo->createStats($this->userId);
                }

                $pointsValue = (int)($task['points_value'] ?? 10);
                $this->userRepo->addPoints($this->userId, $pointsValue);
            }
        }
        if (isset($data['title'])) {
            $titleToUpdate = trim($data['title']);
            if (strlen($titleToUpdate) > 255) {
                $this->errorResponse('Title exceeds maximum length of 255 characters');
            }
            $fields[] = 'title = ?';
            $params[] = $titleToUpdate;
        }
        if (isset($data['category'])) {
            $fields[] = 'category = ?';
            $params[] = $data['category'];
        }
        if (isset($data['priority'])) {
            $priority = (int)$data['priority'];
            $fields[] = 'priority = ?';
            $params[] = $priority;

            $pointsValue = 10 + (3 - $priority) * 5;
            $fields[] = 'points_value = ?';
            $params[] = $pointsValue;
        }
        if (array_key_exists('due_date', $data)) {
            $fields[] = 'due_date = ?';
            $params[] = !empty($data['due_date']) ? $data['due_date'] : null;
        }

        if (empty($fields)) {
            $this->jsonResponse(['message' => 'No changes']);
        }

        $this->taskRepo->updateTaskFields($id, $fields, $params);

        $this->jsonResponse(['message' => 'Task updated']);
    }

    public function destroy()
    {
        $this->requireAuth();
        $id = $_GET['id'] ?? null;
        if (!$id) {
            $this->errorResponse('ID is required', 400);
        }

        $this->taskRepo->deleteTask($id, $this->userId);

        $this->jsonResponse(['message' => 'Task deleted']);
    }
}