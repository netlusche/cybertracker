<?php
// api/repositories/AdminRepository.php
require_once __DIR__ . '/Repository.php';

class AdminRepository extends Repository
{
    public function countUsers(string $search): int
    {
        $searchQuery = '';
        $params = [];
        if (!empty($search)) {
            $searchQuery = "WHERE username LIKE :search";
            $params[':search'] = "%$search%";
        }

        $countSql = "SELECT COUNT(*) FROM users $searchQuery";
        $totalStmt = $this->pdo->prepare($countSql);
        $totalStmt->execute($params);
        return (int)$totalStmt->fetchColumn();
    }

    public function getUsers(int $limit, int $offset, string $sortBy, string $sortDir, string $search): array
    {
        $searchQuery = '';
        $params = [];
        if (!empty($search)) {
            $searchQuery = "WHERE username LIKE :search";
            $params[':search'] = "%$search%";
        }

        $sql = "SELECT id, username, role, is_verified, created_at, last_login, two_factor_enabled 
                FROM users 
                $searchQuery
                ORDER BY (CASE WHEN role = 'admin' THEN 0 ELSE 1 END), $sortBy $sortDir 
                LIMIT :limit OFFSET :offset";

        $stmt = $this->pdo->prepare($sql);
        foreach ($params as $key => $val) {
            $stmt->bindValue($key, $val);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getSettings(): array
    {
        $stmt = $this->pdo->query("SELECT setting_key, setting_value FROM system_settings");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $settings = [];
        foreach ($rows as $row) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }
        return $settings;
    }

    public function getSetting(string $key)
    {
        $stmt = $this->pdo->prepare("SELECT setting_value FROM system_settings WHERE setting_key = ?");
        $stmt->execute([$key]);
        $row = $stmt->fetch();
        return $row ? $row['setting_value'] : null;
    }

    public function updateSetting(string $key, string $value): void
    {
        $stmt = $this->pdo->prepare("REPLACE INTO system_settings (setting_key, setting_value) VALUES (?, ?)");
        $stmt->execute([$key, $value]);
    }

    public function countVerifiedAdmins(): int
    {
        $stmt = $this->pdo->query("SELECT COUNT(*) as count FROM users WHERE role = 'admin' AND is_verified = 1");
        return (int)$stmt->fetchColumn();
    }

    public function countTotalAdmins(): int
    {
        $stmt = $this->pdo->query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
        return (int)$stmt->fetchColumn();
    }

    public function toggleUserVerification(int $userId, int $newStatus): void
    {
        $update = $this->pdo->prepare("UPDATE users SET is_verified = ? WHERE id = ?");
        $update->execute([$newStatus, $userId]);
    }

    public function updateUserRole(int $userId, string $newRole): void
    {
        $update = $this->pdo->prepare("UPDATE users SET role = ? WHERE id = ?");
        $update->execute([$newRole, $userId]);
    }

    public function disableUser2FA(int $userId): void
    {
        $stmt = $this->pdo->prepare("UPDATE users SET two_factor_enabled = 0, two_factor_secret = NULL, two_factor_method = 'totp', two_factor_backup_codes = NULL WHERE id = ?");
        $stmt->execute([$userId]);
    }
}