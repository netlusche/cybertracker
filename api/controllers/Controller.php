<?php
// api/controllers/Controller.php

require_once __DIR__ . '/../repositories/UserRepository.php';
require_once __DIR__ . '/../repositories/TaskRepository.php';
require_once __DIR__ . '/../repositories/CategoryRepository.php';
require_once __DIR__ . '/../repositories/AdminRepository.php';

class Controller
{
    protected PDO $pdo;
    protected ?int $userId;

    protected UserRepository $userRepo;
    protected TaskRepository $taskRepo;
    protected CategoryRepository $categoryRepo;
    protected AdminRepository $adminRepo;

    public function __construct()
    {
        $this->pdo = getDBConnection();
        $this->userId = $_SESSION['user_id'] ?? null;

        $this->userRepo = new UserRepository($this->pdo);
        $this->taskRepo = new TaskRepository($this->pdo);
        $this->categoryRepo = new CategoryRepository($this->pdo);
        $this->adminRepo = new AdminRepository($this->pdo);
    }

    protected function jsonResponse(array $data, int $status = 200): void
    {
        http_response_code($status);
        echo json_encode($data);
        exit;
    }

    protected function errorResponse(string $message, int $status = 400): void
    {
        $this->jsonResponse(['error' => $message], $status);
    }

    protected function requireAuth(): void
    {
        if (!$this->userId && !isset($_SESSION['partial_id'])) {
            $this->errorResponse('Unauthorized', 401);
        }
    }

    protected function getJsonBody(): array
    {
        $data = json_decode(file_get_contents("php://input"), true);
        return is_array($data) ? $data : [];
    }

    protected function getClientIp(): string
    {
        return $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    }
}