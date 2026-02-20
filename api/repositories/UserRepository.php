<?php
// api/repositories/UserRepository.php
require_once __DIR__ . '/Repository.php';

class UserRepository extends Repository
{
    public function findById(int $id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function findByUsernameOrEmail(string $identifier)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE username = ? OR email = ?");
        $stmt->execute([$identifier, $identifier]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function findByEmail(string $email)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function findByVerificationToken(string $token)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE verification_token = ?");
        $stmt->execute([$token]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function findByResetToken(string $token, string $nowDate)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE reset_token = ? AND reset_expires > ?");
        $stmt->execute([$token, $nowDate]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Rate Limiting Auth
    public function recordLoginAttempt(string $ip, string $endpoint, bool $success): void
    {
        $stmt = $this->pdo->prepare("INSERT INTO auth_logs (ip_address, endpoint, success) VALUES (?, ?, ?)");
        $stmt->execute([$ip, $endpoint, $success ? 1 : 0]);
    }

    public function countRecentFailedAttempts(string $ip, string $endpoint, int $windowMinutes): int
    {
        $threshold = date('Y-m-d H:i:s', strtotime("-$windowMinutes minutes"));
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM auth_logs WHERE ip_address = ? AND endpoint = ? AND success = 0 AND created_at > ?");
        $stmt->execute([$ip, $endpoint, $threshold]);
        return (int)$stmt->fetchColumn();
    }

    public function updateLastLogin(int $userId): void
    {
        $this->pdo->prepare("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?")->execute([$userId]);
    }

    // Creating User
    public function create(string $username, string $email, string $hash, string $vToken): int
    {
        $stmt = $this->pdo->prepare("INSERT INTO users (username, password, email, verification_token, is_verified) VALUES (?, ?, ?, ?, 0)");
        $stmt->execute([$username, $hash, $email, $vToken]);
        $userId = (int)$this->pdo->lastInsertId();

        $this->pdo->prepare("INSERT INTO user_stats (id, total_points, current_level, badges_json) VALUES (?, 0, 1, '[]')")->execute([$userId]);

        $categoriesSql = "INSERT INTO user_categories (user_id, name, is_default) VALUES 
            (?, 'Private', 1), (?, 'Work', 0), (?, 'Health', 0), (?, 'Finance', 0), (?, 'Hobby', 0)";
        $this->pdo->prepare($categoriesSql)->execute([$userId, $userId, $userId, $userId, $userId]);

        $tasksSql = "INSERT INTO tasks (user_id, title, category, priority, points_value) VALUES 
            (?, 'Debug Neural Link Interface', 'Work', 2, 15),
            (?, 'Hack Coffee Machine Subnet', 'Work', 2, 15),
            (?, 'Feed the Techno-Cat', 'Private', 3, 10),
            (?, 'Install Sleep.exe Patch', 'Health', 1, 20)";
        $this->pdo->prepare($tasksSql)->execute([$userId, $userId, $userId, $userId]);

        return $userId;
    }

    public function updatePassword(int $userId, string $hash): void
    {
        $this->pdo->prepare("UPDATE users SET password = ? WHERE id = ?")->execute([$hash, $userId]);
    }

    public function updateTheme(int $userId, string $theme): void
    {
        $this->pdo->prepare("UPDATE users SET theme = ? WHERE id = ?")->execute([$theme, $userId]);
    }

    public function deleteAccount(int $userId): void
    {
        $this->pdo->prepare("DELETE FROM tasks WHERE user_id = ?")->execute([$userId]);
        $this->pdo->prepare("DELETE FROM user_categories WHERE user_id = ?")->execute([$userId]);
        $this->pdo->prepare("DELETE FROM user_stats WHERE id = ?")->execute([$userId]);
        $this->pdo->prepare("DELETE FROM users WHERE id = ?")->execute([$userId]);
    }

    // Profile Updates
    public function updateEmailAndVerification(int $userId, string $newEmail, string $token): void
    {
        $this->pdo->prepare("UPDATE users SET email = ?, is_verified = 0, verification_token = ? WHERE id = ?")->execute([$newEmail, $token, $userId]);
    }

    public function markEmailAsVerified(int $userId): void
    {
        $this->pdo->prepare("UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?")->execute([$userId]);
    }

    public function setPasswordResetToken(int $userId, string $token, string $expires): void
    {
        $this->pdo->prepare("UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?")->execute([$token, $expires, $userId]);
    }

    public function clearPasswordResetToken(int $userId): void
    {
        $this->pdo->prepare("UPDATE users SET reset_token = NULL, reset_expires = NULL WHERE id = ?")->execute([$userId]);
    }

    // 2FA Management
    public function enableTotp2fa(int $userId, string $secret, string $backupCodesJson): void
    {
        $this->pdo->prepare("UPDATE users SET two_factor_secret = ?, two_factor_enabled = 1, two_factor_method = 'totp', two_factor_backup_codes = ? WHERE id = ?")->execute([$secret, $backupCodesJson, $userId]);
    }

    public function enableEmail2fa(int $userId, string $backupCodesJson): void
    {
        $this->pdo->prepare("UPDATE users SET two_factor_enabled = 1, two_factor_method = 'email', two_factor_secret = NULL, two_factor_backup_codes = ? WHERE id = ?")->execute([$backupCodesJson, $userId]);
    }

    public function disable2fa(int $userId): void
    {
        $this->pdo->prepare("UPDATE users SET two_factor_enabled = 0, two_factor_secret = NULL, two_factor_method = NULL, two_factor_backup_codes = NULL WHERE id = ?")->execute([$userId]);
    }

    public function updateBackupCodes(int $userId, string $backupCodesJson): void
    {
        $this->pdo->prepare("UPDATE users SET two_factor_backup_codes = ? WHERE id = ?")->execute([$backupCodesJson, $userId]);
    }

    // Stats
    public function getStats(int $userId)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM user_stats WHERE id = ?");
        $stmt->execute([$userId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createStats(int $userId): void
    {
        $this->pdo->prepare("INSERT INTO user_stats (id, total_points, current_level, badges_json) VALUES (?, 0, 1, '[]')")->execute([$userId]);
    }

    public function updateStatsLevel(int $userId, int $level): void
    {
        $this->pdo->prepare("UPDATE user_stats SET current_level = ? WHERE id = ?")->execute([$level, $userId]);
    }

    public function addPoints(int $userId, int $points): void
    {
        if ($points === 0)
            return;

        $sql = "UPDATE user_stats SET total_points = total_points + ? WHERE id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$points, $userId]);
    }
}