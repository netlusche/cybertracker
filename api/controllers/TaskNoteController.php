<?php
// api/controllers/TaskNoteController.php

class TaskNoteController extends Controller
{
    public function index()
    {
        $this->requireAuth();

        $taskId = $_GET['task_id'] ?? null;
        if (!$taskId) {
            $this->errorResponse('Task ID is required');
        }

        // Check if task exists and belongs to user
        $task = $this->taskRepo->getTaskById((int)$taskId, $this->userId);
        if (!$task) {
            $this->errorResponse('Task not found or unauthorized access', 404);
        }

        $notes = $this->taskNoteRepo->getNotesByTaskId((int)$taskId, $this->userId);
        $this->jsonResponse($notes);
    }

    public function store()
    {
        $this->requireAuth();
        $data = $this->getJsonBody();

        if (!isset($data['task_id']) || !isset($data['note_text'])) {
            $this->errorResponse('Task ID and note_text are required');
        }

        $taskId = (int)$data['task_id'];
        $text = trim($data['note_text']);

        if ($text === '') {
            $this->errorResponse('Note text cannot be empty');
        }

        // Verify task ownership
        $task = $this->taskRepo->getTaskById($taskId, $this->userId);
        if (!$task) {
            $this->errorResponse('Task not found or unauthorized access', 404);
        }

        try {
            $note = $this->taskNoteRepo->createNote($taskId, $this->userId, $text);
            $this->jsonResponse($note, 201);
        }
        catch (PDOException $e) {
            $this->errorResponse('Failed to create note', 500);
        }
    }

    public function update()
    {
        $this->requireAuth();
        $data = $this->getJsonBody();

        if (!isset($data['id']) || !isset($data['note_text'])) {
            $this->errorResponse('Note ID and note_text are required');
        }

        $noteId = (int)$data['id'];
        $text = trim($data['note_text']);

        if ($text === '') {
            $this->errorResponse('Note text cannot be empty');
        }

        try {
            $note = $this->taskNoteRepo->updateNote($noteId, $this->userId, $text);
            if (!$note) {
                $this->errorResponse('Note not found or unauthorized access', 404);
            }
            $this->jsonResponse($note);
        }
        catch (PDOException $e) {
            $this->errorResponse('Failed to update note', 500);
        }
    }

    public function destroy()
    {
        $this->requireAuth();

        $noteId = $_GET['id'] ?? null;
        if (!$noteId) {
            $this->errorResponse('Note ID is required');
        }

        try {
            $deleted = $this->taskNoteRepo->deleteNote((int)$noteId, $this->userId);
            if ($deleted) {
                $this->jsonResponse(['success' => true]);
            }
            else {
                $this->errorResponse('Note not found or unauthorized access', 404);
            }
        }
        catch (PDOException $e) {
            $this->errorResponse('Failed to delete note', 500);
        }
    }
}