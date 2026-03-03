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

    public function updateLanguage(int $id, string $lang): bool
    {
        $stmt = $this->pdo->prepare("UPDATE users SET language = ? WHERE id = ?");
        return $stmt->execute([$lang, $id]);
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
    public function recordLoginAttempt(string $username, string $ip, string $endpoint, bool $success): void
    {
        try {
            $stmt = $this->pdo->prepare("INSERT INTO auth_logs (ip_address, endpoint, success, username) VALUES (?, ?, ?, ?)");
            $stmt->execute([$ip, $endpoint, $success ? 1 : 0, $username]);
        }
        catch (PDOException $e) {
            $this->pdo->exec("ALTER TABLE auth_logs ADD COLUMN username VARCHAR(50) DEFAULT NULL");
            $stmt = $this->pdo->prepare("INSERT INTO auth_logs (ip_address, endpoint, success, username) VALUES (?, ?, ?, ?)");
            $stmt->execute([$ip, $endpoint, $success ? 1 : 0, $username]);
        }
    }

    public function countRecentFailedAttempts(string $username, string $ip, string $endpoint, int $windowMinutes): int
    {
        $threshold = date('Y-m-d H:i:s', strtotime("-$windowMinutes minutes"));
        try {
            $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM auth_logs WHERE (ip_address = ? OR username = ?) AND endpoint = ? AND success = 0 AND created_at > ?");
            $stmt->execute([$ip, $username, $endpoint, $threshold]);
            return (int)$stmt->fetchColumn();
        }
        catch (PDOException $e) {
            // Fallback if column not yet created
            $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM auth_logs WHERE ip_address = ? AND endpoint = ? AND success = 0 AND created_at > ?");
            $stmt->execute([$ip, $endpoint, $threshold]);
            return (int)$stmt->fetchColumn();
        }
    }

    public function updateLastLogin(int $userId): void
    {
        $this->pdo->prepare("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?")->execute([$userId]);
    }

    // Creating User
    public function create(string $username, string $email, string $hash, string $vToken, string $lang = 'en'): int
    {
        $stmt = $this->pdo->prepare("INSERT INTO users (username, password, email, verification_token, is_verified, language) VALUES (?, ?, ?, ?, 0, ?)");
        $stmt->execute([$username, $hash, $email, $vToken, $lang]);
        $userId = (int)$this->pdo->lastInsertId();

        $this->pdo->prepare("INSERT INTO user_stats (id, total_points, current_level, badges_json) VALUES (?, 0, 1, '[]')")->execute([$userId]);

        $categoriesSql = "INSERT INTO user_categories (user_id, name, is_default) VALUES 
            (?, 'Private', 1), (?, 'Work', 0), (?, 'Health', 0), (?, 'Finance', 0), (?, 'Hobby', 0)";
        $this->pdo->prepare($categoriesSql)->execute([$userId, $userId, $userId, $userId, $userId]);

        $statusesSql = "INSERT INTO user_task_statuses (user_id, name, is_system, sort_order) VALUES 
            (?, 'open', 1, 1), (?, 'in progress', 0, 2), (?, 'under review', 0, 3), (?, 'completed', 1, 4)";
        $this->pdo->prepare($statusesSql)->execute([$userId, $userId, $userId, $userId]);

        $tasksSql = "INSERT INTO tasks (user_id, title, category, priority, points_value, description) VALUES 
            (?, 'Debug Neural Link Interface', 'Work', 2, 15, 'Connect to the mainframe and identify the latency issues in the temporal cortex bridge. The signal delay is currently at 45ms, which is unacceptable for live-fire operations. Check the primary optical relays.'),
            (?, 'Hack Coffee Machine Subnet', 'Work', 2, 15, 'The new Weyland-Yutani espresso machine on Level 4 has hardcoded DRM on the extra-dark roast. Bypass the authentication protocol and secure unlimited access.'),
            (?, 'Feed the Techno-Cat', 'Private', 3, 10, 'Schrödinger requires his daily nutrient paste. Ensure the auto-feeder hopper is loaded and the biometric scanner recognizes him.'),
            (?, 'Install Sleep.exe Patch', 'Health', 1, 20, 'System fatigue levels approaching critical. Initiate a mandatory 8-hour offline cycle to defragment memory and restore cognitive function levels.')";
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

    // Calendar Token Management
    public function findByCalendarToken(string $token)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE calendar_token = ?");
        $stmt->execute([$token]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function generateCalendarToken(int $userId): string
    {
        $token = bin2hex(random_bytes(32));
        $this->pdo->prepare("UPDATE users SET calendar_token = ? WHERE id = ?")->execute([$token, $userId]);
        return $token;
    }

    public function clearCalendarToken(int $userId): void
    {
        $this->pdo->prepare("UPDATE users SET calendar_token = NULL WHERE id = ?")->execute([$userId]);
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