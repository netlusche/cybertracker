<?php
// api/controllers/AdminController.php

class AdminController extends Controller
{
    private function requireAdmin(): void
    {
        $this->requireAuth();

        $user = $this->userRepo->findById($this->userId);

        if (!$user || $user['role'] !== 'admin') {
            $this->errorResponse('Access Denied: Admin Clearance Required', 403);
        }
    }

    public function listUsers()
    {
        $this->requireAdmin();

        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        if ($page < 1)
            $page = 1;
        $limit = 10;
        $offset = ($page - 1) * $limit;

        $allowedSorts = ['id', 'username', 'is_verified', 'last_login'];
        $sortBy = $_GET['sort'] ?? 'id';
        $sortDir = strtoupper($_GET['dir'] ?? 'ASC');

        if (!in_array($sortBy, $allowedSorts))
            $sortBy = 'id';
        if ($sortDir !== 'ASC' && $sortDir !== 'DESC')
            $sortDir = 'ASC';

        $search = $_GET['search'] ?? '';

        $totalUsers = $this->adminRepo->countUsers($search);
        $totalPages = (int)ceil($totalUsers / $limit);

        $users = $this->adminRepo->getUsers($limit, $offset, $sortBy, $sortDir, $search);

        $this->jsonResponse([
            'users' => $users,
            'totalUsers' => $totalUsers,
            'totalPages' => $totalPages,
            'currentPage' => $page
        ]);
    }

    public function getSettings()
    {
        $this->requireAdmin();

        try {
            $settings = $this->adminRepo->getSettings();
            $this->jsonResponse($settings);
        }
        catch (Exception $e) {
            error_log("Admin settings fetch error: " . $e->getMessage());
            $this->errorResponse('Failed to fetch settings due to an internal error.', 500);
        }
    }

    public function toggleVerified()
    {
        $this->requireAdmin();
        $data = $this->getJsonBody();
        $targetId = $data['target_id'] ?? null;

        if (!$targetId) {
            $this->errorResponse('Missing target_id');
        }

        $targetUser = $this->userRepo->findById($targetId);

        if (!$targetUser) {
            $this->errorResponse('User not found', 404);
        }

        $newStatus = $targetUser['is_verified'] ? 0 : 1;

        if ($newStatus === 0 && $targetUser['role'] === 'admin') {
            $count = $this->adminRepo->countVerifiedAdmins();
            if ($count <= 1) {
                $this->errorResponse('Cannot unverify the last verified Admin.', 409);
            }
        }

        $this->adminRepo->toggleUserVerification($targetId, $newStatus);

        $this->jsonResponse(['success' => true, 'new_status' => $newStatus]);
    }

    public function updateRole()
    {
        $this->requireAdmin();
        $data = $this->getJsonBody();
        $targetId = $data['target_id'] ?? null;
        $newRole = $data['new_role'] ?? null;

        if (!$targetId || !$newRole) {
            $this->errorResponse('Missing parameters');
        }

        if ($newRole !== 'admin' && $newRole !== 'user') {
            $this->errorResponse('Invalid role');
        }

        if ($newRole === 'user') {
            $adminCount = $this->adminRepo->countTotalAdmins();
            $targetUser = $this->userRepo->findById($targetId);

            if ($targetUser && $targetUser['role'] === 'admin' && $adminCount <= 1) {
                $this->errorResponse('Cannot demote the last remaining Admin.', 409);
            }
        }

        $this->adminRepo->updateUserRole($targetId, $newRole);

        $this->jsonResponse(['success' => true]);
    }

    public function deleteUser()
    {
        $this->requireAdmin();
        $data = $this->getJsonBody();
        $targetId = $data['target_id'] ?? null;

        if (!$targetId) {
            $this->errorResponse('Missing target_id');
        }

        $targetUser = $this->userRepo->findById($targetId);

        if ($targetUser && $targetUser['role'] === 'admin') {
            $count = $this->adminRepo->countTotalAdmins();
            if ($count <= 1) {
                $this->errorResponse('Cannot delete the last remaining Admin.', 409);
            }
        }

        $this->userRepo->deleteAccount($targetId);

        $this->jsonResponse(['success' => true]);
    }

    public function resetPassword()
    {
        $this->requireAdmin();
        $data = $this->getJsonBody();
        $targetId = $data['target_id'] ?? null;
        $newPass = $data['new_password'] ?? null;

        if (!$targetId || !$newPass) {
            $this->errorResponse('Missing parameters');
        }

        $hash = password_hash($newPass, PASSWORD_DEFAULT);
        $this->userRepo->updatePassword($targetId, $hash);

        $this->jsonResponse(['success' => true, 'message' => 'Password reset']);
    }

    public function disable2fa()
    {
        $this->requireAdmin();
        $data = $this->getJsonBody();
        $targetId = $data['target_id'] ?? null;

        if (!$targetId) {
            $this->errorResponse('Missing target ID');
        }

        $this->adminRepo->disableUser2FA($targetId);

        $this->jsonResponse(['success' => true, 'message' => '2FA Disabled']);
    }

    public function updateSetting()
    {
        $this->requireAdmin();
        $data = $this->getJsonBody();
        $key = $data['key'] ?? null;
        $value = $data['value'] ?? null;

        if (!$key) {
            $this->errorResponse('Missing setting key');
        }

        $allowedSettings = ['strict_password_policy'];
        if (!in_array($key, $allowedSettings)) {
            $this->errorResponse('Invalid setting key: ' . htmlspecialchars($key));
        }

        $this->adminRepo->updateSetting($key, $value);

        $this->jsonResponse(['success' => true]);
    }
}