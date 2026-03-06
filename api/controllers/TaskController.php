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
        $completed = isset($_GET['completed']) && $_GET['completed'] === 'true';

        $totalParam = $this->taskRepo->countFilteredTasks($this->userId, $search, $priority, $category, $overdue, $completed);
        $tasks = $this->taskRepo->getFilteredTasks($this->userId, $search, $priority, $category, $overdue, $completed, $limit, $offset);
        $hasCompletedTasks = $this->taskRepo->checkIfUserHasCompletedTasks($this->userId);

        $this->jsonResponse([
            'data' => $tasks,
            'meta' => [
                'current_page' => $page,
                'limit' => $limit,
                'total_tasks' => $totalParam,
                'total_pages' => $limit > 0 ? ceil($totalParam / $limit) : 1,
                'has_completed_tasks' => $hasCompletedTasks
            ]
        ]);
    }

    public function calendar()
    {
        $this->requireAuth();
        $tasks = $this->taskRepo->getCalendarTasks($this->userId);
        $this->jsonResponse($tasks);
    }

    public function calendarFeed()
    {
        // Public endpoint, authenticates via token GET param
        $token = $_GET['token'] ?? '';
        if (empty($token)) {
            $this->errorResponse('Access denied', 403);
        }

        $user = $this->userRepo->findByCalendarToken($token);
        if (!$user) {
            $this->errorResponse('Invalid token', 403);
        }

        $userId = $user['id'];
        $tasks = $this->taskRepo->getCalendarTasks($userId);

        // Generate ICS format
        $output = "BEGIN:VCALENDAR\r\n";
        $output .= "VERSION:2.0\r\n";
        $output .= "PRODID:-//CyberTasker//WebCal//EN\r\n";
        $output .= "CALSCALE:GREGORIAN\r\n";
        $output .= "X-WR-CALNAME:CyberTasker Directives (" . $user['username'] . ")\r\n";

        foreach ($tasks as $task) {
            if (empty($task['due_date'])) {
                continue;
            }

            // Parse dates
            $dtStart = date('Ymd\THis', strtotime($task['due_date']));
            $dtEnd = date('Ymd\THis', strtotime($task['due_date'] . ' +1 hour')); // 1 hr default block
            $dtStamp = date('Ymd\THis'); // Now

            $uid = "cybertasker-" . $task['id'] . "@" . ($_SERVER['HTTP_HOST'] ?? 'localhost');

            $title = $task['title'];
            if (!empty($task['category'])) {
                $title = "[" . $task['category'] . "] " . $title;
            }

            switch ($task['priority']) {
                case 1:
                    $prioLabel = " [HIGH PRIO]";
                    break;
                case 3:
                    $prioLabel = " [LOW PRIO]";
                    break;
                default:
                    $prioLabel = "";
                    break;
            }
            $title .= $prioLabel;

            $output .= "BEGIN:VEVENT\r\n";
            $output .= "UID:$uid\r\n";
            $output .= "DTSTAMP:$dtStamp\r\n";
            $output .= "DTSTART:$dtStart\r\n";
            $output .= "DTEND:$dtEnd\r\n";
            $output .= "SUMMARY:" . $this->escapeIcal($title) . "\r\n";
            // Security constraint: Explicitly excluding DESCRIPTION for data minimization
            // $output .= "DESCRIPTION:" . $this->escapeIcal($task['description']) . "\\n"; 
            $output .= "END:VEVENT\r\n";
        }

        $output .= "END:VCALENDAR\r\n";

        // Output headers for ICS download
        header('Content-Type: text/calendar; charset=utf-8');
        header('Content-Disposition: inline; filename="cybertasker_feed.ics"');
        header('Cache-Control: private, max-age=0, must-revalidate');

        echo $output;
        exit();
    }

    private function escapeIcal($string)
    {
        if (empty($string))
            return '';
        $string = str_replace('\\', '\\\\', $string);
        $string = str_replace(';', '\\;', $string);
        $string = str_replace(',', '\\,', $string);
        $string = str_replace("\n", '\\n', $string);
        $string = str_replace("\r", '', $string);
        return $string;
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
        $recurrenceInterval = !empty($data['recurrence_interval']) ? $data['recurrence_interval'] : null;
        $recurrenceEndDate = !empty($data['recurrence_end_date']) ? $data['recurrence_end_date'] : null;
        $description = !empty($data['description']) ? $data['description'] : null;
        $subroutinesJson = !empty($data['subroutines_json']) ? $data['subroutines_json'] : null;

        if (strtolower($recurrenceInterval) !== 'none' && $recurrenceInterval !== null && empty($dueDate)) {
            $dueDate = date('Y-m-d');
        }

        $taskId = $this->taskRepo->createTask($this->userId, $title, $category, $priority, $points, $dueDate, $description, null, null, $subroutinesJson, $recurrenceInterval, $recurrenceEndDate);

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
        file_put_contents('/Users/frank/Antigravity/CyberTasker3.0/api_error.log', "UPDATE CALLED FOR ID $id: " . json_encode($data) . "\n", FILE_APPEND);


        $task = $this->taskRepo->getTaskById($id, $this->userId);
        if (!$task) {
            $this->errorResponse('Forbidden', 403);
        }

        $changed = $this->processTaskUpdate($id, $data, $task);
        if (!$changed) {
            $this->jsonResponse(['message' => 'No changes']);
        }

        $this->jsonResponse(['message' => 'Task updated']);
    }

    public function bulkUpdate()
    {
        $this->requireAuth();
        $data = $this->getJsonBody();

        if (!isset($data['task_ids']) || !is_array($data['task_ids'])) {
            $this->errorResponse('task_ids array is required');
        }

        $updatedCount = 0;
        foreach ($data['task_ids'] as $id) {
            $task = $this->taskRepo->getTaskById($id, $this->userId);
            if ($task) {
                $changed = $this->processTaskUpdate($id, $data, $task);
                if ($changed) {
                    $updatedCount++;
                }
            }
        }

        $this->jsonResponse([
            'message' => 'Tasks updated',
            'updated_count' => $updatedCount
        ]);
    }

    public function bulkDelete()
    {
        $this->requireAuth();
        $data = $this->getJsonBody();

        if (!isset($data['task_ids']) || !is_array($data['task_ids'])) {
            $this->errorResponse('task_ids array is required');
        }

        $deletedCount = $this->taskRepo->deleteMultipleTasks($data['task_ids'], $this->userId);

        $this->jsonResponse([
            'message' => 'Tasks deleted',
            'deleted_count' => $deletedCount
        ]);
    }

    protected function processTaskUpdate(int $id, array $data, array $task): bool
    {
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

                // --- RECURRENCE LOGIC (Create-on-completion) ---
                $interval = strtolower($task['recurrence_interval'] ?? 'none');

                // If it's becoming a duplicate target, but the interval is removed in this same request, check for it in $data.
                if (isset($data['recurrence_interval'])) {
                    $interval = strtolower($data['recurrence_interval']);
                }

                if ($interval && $interval !== 'none') {
                    $modifier = '';
                    switch ($interval) {
                        case 'daily':
                            $modifier = '+1 day';
                            break;
                        case 'weekly':
                            $modifier = '+1 week';
                            break;
                        case 'monthly':
                            $modifier = '+1 month';
                            break;
                        case 'yearly':
                            $modifier = '+1 year';
                            break;
                    }

                    if ($modifier !== '') {
                        $baseDate = $task['due_date'] ?? date('Y-m-d H:i:s');
                        $nextDate = date('Y-m-d H:i:s', strtotime($baseDate . ' ' . $modifier));
                        $endDateObj = null;

                        $endDateStr = $task['recurrence_end_date'] ?? null;
                        if (array_key_exists('recurrence_end_date', $data)) {
                            $endDateStr = $data['recurrence_end_date'];
                        }

                        if (!empty($endDateStr)) {
                            $endDateObj = new DateTime($endDateStr);
                            $endDateObj->setTime(23, 59, 59);
                        }

                        if (!$endDateObj || new DateTime($nextDate) <= $endDateObj) {
                            // Reset subroutines completion
                            $newSubroutines = null;
                            $oldSubJson = $task['subroutines_json'] ?? null;
                            if (array_key_exists('subroutines_json', $data)) {
                                $oldSubJson = $data['subroutines_json']; // Use the updated ones if saving at same time
                            }

                            if (!empty($oldSubJson)) {
                                $subs = json_decode($oldSubJson, true);
                                if (is_array($subs)) {
                                    foreach ($subs as &$sub) {
                                        $sub['completed'] = false; // Reset to untouched state
                                    }
                                    $newSubroutines = json_encode($subs);
                                }
                            }

                            // Clone the task data with the new due_date
                            $this->taskRepo->createTask(
                                $this->userId,
                                $task['title'] ?? (isset($data['title']) ? $data['title'] : 'Task'),
                                $task['category'] ?? (isset($data['category']) ? $data['category'] : 'General'),
                                (int)($task['priority'] ?? (isset($data['priority']) ? $data['priority'] : 2)),
                                (int)($task['points_value'] ?? 10),
                                $nextDate,
                                $task['description'] ?? (isset($data['description']) ? $data['description'] : null),
                                $task['attachments'] ?? (isset($data['attachments']) ? $data['attachments'] : null),
                                $task['files'] ?? (isset($data['files']) ? $data['files'] : null),
                                $newSubroutines,
                                $interval,
                                $endDateStr
                            );
                        }
                    }
                }
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
        $finalInterval = array_key_exists('recurrence_interval', $data) ? $data['recurrence_interval'] : ($task['recurrence_interval'] ?? null);

        if (array_key_exists('due_date', $data)) {
            $incomingDueDate = !empty($data['due_date']) ? $data['due_date'] : null;
            if (empty($incomingDueDate) && strtolower($finalInterval ?? 'none') !== 'none' && !empty($finalInterval)) {
                $incomingDueDate = date('Y-m-d');
            }
            $fields[] = 'due_date = ?';
            $params[] = $incomingDueDate;
        }
        else if (empty($task['due_date']) && strtolower($finalInterval ?? 'none') !== 'none' && !empty($finalInterval)) {
            $fields[] = 'due_date = ?';
            $params[] = date('Y-m-d');
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
        if (array_key_exists('subroutines_json', $data)) {
            $fields[] = 'subroutines_json = ?';
            $params[] = !empty($data['subroutines_json']) ? $data['subroutines_json'] : null;
        }
        if (array_key_exists('recurrence_interval', $data)) {
            $fields[] = 'recurrence_interval = ?';
            $params[] = !empty($data['recurrence_interval']) ? $data['recurrence_interval'] : null;
        }
        if (array_key_exists('recurrence_end_date', $data)) {
            $fields[] = 'recurrence_end_date = ?';
            $params[] = !empty($data['recurrence_end_date']) ? $data['recurrence_end_date'] : null;
        }
        if (array_key_exists('workflow_status', $data)) {
            $fields[] = 'workflow_status = ?';
            $params[] = !empty($data['workflow_status']) ? $data['workflow_status'] : null;
        }

        if (empty($fields)) {
            return false;
        }

        $this->taskRepo->updateTaskFields($id, $fields, $params);

        return true;
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

    public function bulkDeleteCompleted()
    {
        $this->requireAuth();

        $deletedCount = $this->taskRepo->deleteCompletedTasks($this->userId);

        $this->jsonResponse([
            'message' => 'Completed tasks purged successfully',
            'deleted_count' => $deletedCount
        ]);
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