<?php
// api/repositories/TaskNoteRepository.php
require_once __DIR__ . '/Repository.php';

class TaskNoteRepository extends Repository
{
    public function getNotesByTaskId(int $taskId, int $userId): array
    {
        // Join with users table to get the username of the author
        $stmt = $this->pdo->prepare("
            SELECT tn.id, tn.task_id, tn.user_id, tn.note_text, tn.created_at, tn.updated_at, u.username 
            FROM task_notes tn
            JOIN tasks t ON tn.task_id = t.id
            LEFT JOIN users u ON tn.user_id = u.id
            WHERE tn.task_id = ? AND t.user_id = ?
            ORDER BY tn.created_at ASC
        ");
        $stmt->execute([$taskId, $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function createNote(int $taskId, int $userId, string $text): array
    {
        // Insert note
        $stmt = $this->pdo->prepare("INSERT INTO task_notes (task_id, user_id, note_text) VALUES (?, ?, ?)");
        $stmt->execute([$taskId, $userId, $text]);
        $id = (int)$this->pdo->lastInsertId();

        return $this->getNoteById($id, $userId);
    }

    public function updateNote(int $noteId, int $userId, string $text): ?array
    {
        $stmt = $this->pdo->prepare("UPDATE task_notes SET note_text = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?");
        $stmt->execute([$text, $noteId, $userId]);

        if ($stmt->rowCount() > 0) {
            return $this->getNoteById($noteId, $userId);
        }
        return null;
    }

    public function deleteNote(int $noteId, int $userId): bool
    {
        $stmt = $this->pdo->prepare("DELETE FROM task_notes WHERE id = ? AND user_id = ?");
        $stmt->execute([$noteId, $userId]);
        return $stmt->rowCount() > 0;
    }

    public function getNoteById(int $noteId, int $userId): array
    {
        $stmt = $this->pdo->prepare("
            SELECT tn.id, tn.task_id, tn.user_id, tn.note_text, tn.created_at, tn.updated_at, u.username 
            FROM task_notes tn
            LEFT JOIN users u ON tn.user_id = u.id
            WHERE tn.id = ? AND tn.user_id = ?
        ");
        $stmt->execute([$noteId, $userId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ?: [];
    }
}