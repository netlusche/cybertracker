<?php
// api/controllers/TaskController.php

class TaskController extends Controller
{
    public function index()
    {
        $this->requireAuth();

        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 25;
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

    public function calendar()
    {
        $this->requireAuth();
        $tasks = $this->taskRepo->getCalendarTasks($this->userId);
        $this->jsonResponse($tasks);
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
        if (array_key_exists('description', $data)) {
            $fields[] = 'description = ?';
            $params[] = !empty($data['description']) ? $data['description'] : null;
        }
        if (array_key_exists('attachments', $data)) {
            $fields[] = 'attachments = ?';
            $params[] = !empty($data['attachments']) ? $data['attachments'] : null;
        }
        if (isset($data['files'])) {
            $fields[] = 'files = ?';
            $params[] = $data['files'];
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

    public function downloadFile()
    {
        $this->requireAuth();

        $filename = $_GET['file'] ?? null;
        if (!$filename) {
            $this->errorResponse('Filename missing', 400);
        }

        // Sanitize to prevent path traversal
        $filename = basename($filename);
        $filepath = __DIR__ . '/../uploads/' . $filename;

        if (!file_exists($filepath)) {
            $this->errorResponse('File not found', 404);
        }

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime_type = finfo_file($finfo, $filepath);
        finfo_close($finfo);

        header('Content-Type: ' . $mime_type);
        header('Content-Length: ' . filesize($filepath));
        header('Cache-Control: private, max-age=86400');
        // 'inline' means the browser will try to display it (PDF/images), rather than forced 'attachment'
        header('Content-Disposition: inline; filename="' . $filename . '"');
        readfile($filepath);
        exit();
    }

    public function uploadFiles()
    {
        $this->requireAuth();

        if (!isset($_FILES['files'])) {
            $this->errorResponse('No files uploaded', 400);
        }

        $uploadDir = __DIR__ . '/../uploads/';
        $allowedExtensions = ['png', 'jpg', 'jpeg', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp'];
        $uploadedFiles = [];

        foreach ($_FILES['files']['tmp_name'] as $key => $tmpName) {
            if ($_FILES['files']['error'][$key] === UPLOAD_ERR_OK) {
                $name = basename($_FILES['files']['name'][$key]);
                $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
                if ($ext === 'jpeg')
                    $ext = 'jpg';

                if (!in_array($ext, $allowedExtensions)) {
                    continue;
                }

                $uniqueName = uniqid('task_file_', true) . '.' . $ext;
                $destination = $uploadDir . $uniqueName;

                if (move_uploaded_file($tmpName, $destination)) {
                    $uploadedFiles[] = [
                        "name" => $name,
                        "path" => "api/index.php?route=tasks/download&file=" . $uniqueName,
                        "size" => $_FILES['files']['size'][$key],
                        "type" => $_FILES['files']['type'][$key],
                        "uploaded_at" => date('Y-m-d H:i:s')
                    ];
                }
            }
        }

        $this->jsonResponse([
            "status" => "success",
            "files" => $uploadedFiles
        ]);
    }
}