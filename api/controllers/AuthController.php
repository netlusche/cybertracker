<?php
// api/controllers/AuthController.php

class AuthController extends Controller
{
    // --- RATE LIMITING MIDDLEWARE ---
    private function checkRateLimit(string $endpoint, int $maxAttempts = 5, int $windowMinutes = 15): void
    {
        $ip = $this->getClientIp();
        $attempts = $this->userRepo->countRecentFailedAttempts($ip, $endpoint, $windowMinutes);

        if ($attempts >= $maxAttempts) {
            $this->errorResponse('Too many failed attempts. Please try again later.', 429);
        }
    }

    private function logAuthAttempt(string $endpoint, bool $success): void
    {
        $ip = $this->getClientIp();
        $this->userRepo->recordLoginAttempt($ip, $endpoint, $success);
    }

    // Helper: Check Password Strength
    private function check_password_strength(string $password): true|string
    {
        $settingValue = $this->adminRepo->getSetting('strict_password_policy');
        $isStrict = ($settingValue === '1');

        if (!$isStrict) {
            return true;
        }

        if (strlen($password) < 12)
            return "Password too short (min 12 chars).";
        if (!preg_match('/[A-Z]/', $password))
            return "Password must contain at least one uppercase letter.";
        if (!preg_match('/\d/', $password))
            return "Password must contain at least one number.";
        if (!preg_match('/[\W_]/', $password))
            return "Password must contain at least one special character.";

        return true;
    }

    // --- ENDPOINTS ---

    public function checkStatus()
    {
        if (isset($_SESSION['user_id'])) {
            $user = $this->userRepo->findById($_SESSION['user_id']);
            $stats = $this->userRepo->getStats($_SESSION['user_id']);

            if ($user) {
                $this->jsonResponse([
                    'isAuthenticated' => true,
                    'user' => [
                        'id' => $user['id'],
                        'username' => $user['username'],
                        'email' => $user['email'],
                        'role' => $user['role'],
                        'two_factor_enabled' => (bool)$user['two_factor_enabled'],
                        'two_factor_method' => $user['two_factor_method'],
                        'theme' => $user['theme'],
                        'stats' => $stats
                    ],
                    'csrf_token' => $_SESSION['csrf_token']
                ]);
            }
        }
        $this->jsonResponse(['isAuthenticated' => false]);
    }

    public function login()
    {
        $this->checkRateLimit('login');
        $data = $this->getJsonBody();

        $username = $data['username'] ?? '';
        $password = $data['password'] ?? '';

        $user = $this->userRepo->findByUsernameOrEmail($username);

        if ($user && password_verify($password, $user['password'])) {
            $this->logAuthAttempt('login', true);

            // Check Verification Status
            if (isset($user['is_verified']) && $user['is_verified'] == 0) {
                $this->errorResponse('Account not verified. Please check your email.', 403);
            }

            // Check 2FA
            if ($user['two_factor_enabled']) {
                $_SESSION['partial_id'] = $user['id'];

                if ($user['two_factor_method'] === 'email') {
                    $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
                    $_SESSION['email_2fa_code'] = $code;
                    $_SESSION['email_2fa_time'] = time();
                    $_SESSION['email_2fa_user_id'] = $user['id'];

                    require_once __DIR__ . '/../mail_helper.php';
                    $subject = "CYBER_TASKER // EMERGENCY OVERRIDE CODE";
                    $body = "Operative " . $user['username'] . ",<br><br>A restricted access signal is required for neural link establishment.<br>Use this code to verify your identity:<br><br><b style='font-size: 24px; letter-spacing: 5px; color: #00ffff;'>" . $code . "</b><br><br>SIGNAL DECAY DETECTED. Code self-destructs in 10 minutes.";
                    sendMail($user['email'], $subject, $body);
                }

                $this->jsonResponse(['success' => true, 'requires_2fa' => true, 'two_factor_method' => $user['two_factor_method']]);
            }

            // Standard Login
            session_regenerate_id(true);
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['role'] = $user['role'];
            // error_log("AuthController: Login successful for user_id: " . $user['id']);
            // error_log("AuthController: CSRF Token in session: " . ($_SESSION['csrf_token'] ?? 'NULL'));

            // Record Last Login
            $this->userRepo->updateLastLogin($user['id']);
            $stats = $this->userRepo->getStats($user['id']);

            $this->jsonResponse([
                'success' => true,
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'email' => $user['email'],
                    'role' => $user['role'],
                    'two_factor_enabled' => (bool)$user['two_factor_enabled'],
                    'theme' => $user['theme'],
                    'stats' => $stats
                ],
                'csrf_token' => $_SESSION['csrf_token'],
                'installer_url' => ($user['role'] === 'admin') ? FRONTEND_URL . '/api/install.php?token=' . $_SESSION['csrf_token'] : null
            ]);
        }
        else {
            $this->logAuthAttempt('login', false);
            $this->errorResponse('Invalid credentials', 401);
        }
    }

    public function logout()
    {
        session_destroy();
        $this->jsonResponse(['success' => true]);
    }

    public function register()
    {
        $data = $this->getJsonBody();
        $username = trim($data['username'] ?? '');
        $password = $data['password'] ?? '';
        $email = trim($data['email'] ?? '');

        if (!$username || !$password || !$email) {
            $this->errorResponse('Username, password, and email required');
        }

        $policyCheck = $this->check_password_strength($password);
        if ($policyCheck !== true) {
            $this->errorResponse('Password Policy Violation: ' . $policyCheck);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->errorResponse('Invalid email format');
        }

        $hash = password_hash($password, PASSWORD_DEFAULT);
        $verificationToken = bin2hex(random_bytes(32));

        try {
            $userId = $this->userRepo->create($username, $email, $hash, $verificationToken);

            // Auto-verify for E2E Test users
            if (str_ends_with($email, '@cyber.local')) {
                $this->userRepo->markEmailAsVerified($userId);
            }

            require_once __DIR__ . '/../mail_helper.php';
            $mailSuccess = false;
            try {
                $verifyLink = FRONTEND_URL . "/verify.html?token=" . $verificationToken;
                $subject = "CYBER_TASKER // IDENTITY VERIFICATION";
                $body = "Welcome Operative $username.<br><br>Your identity parameters have been established.<br>Confirm your com-link frequency to bridge the gap:<br><br><a href='$verifyLink' style='color: #00ffff; text-decoration: none;'>$verifyLink</a><br><br>SIGNAL DECAY DETECTED. Access is restricted until confirmed.";
                $mailSuccess = sendMail($email, $subject, $body);
            }
            catch (Throwable $e) {
                error_log("Registration mail failed: " . $e->getMessage());
            }

            if ($mailSuccess) {
                $this->jsonResponse(['success' => true, 'message' => 'User registered. Please check email to verify.']);
            }
            else {
                $this->jsonResponse(['success' => true, 'message' => 'Identity established, but com-link signal failed. Contact Admin to verify your account manually.']);
            }
        }
        catch (PDOException $e) {
            $msg = (strpos($e->getMessage(), 'UNIQUE') !== false) || (strpos($e->getMessage(), 'Duplicate entry') !== false) ? 'Username or Email already exists' : 'Registration Error: Database failure';
            $this->errorResponse($msg, 409);
        }
    }

    public function verifyEmail()
    {
        $data = $this->getJsonBody();
        $token = $data['token'] ?? '';

        if (!$token) {
            $this->errorResponse('Missing token');
        }

        $user = $this->userRepo->findByVerificationToken($token);

        if ($user) {
            $this->userRepo->markEmailAsVerified($user['id']);
            $this->jsonResponse(['success' => true, 'message' => 'Account verified! You can now login.']);
        }
        else {
            $this->errorResponse('Invalid or expired token');
        }
    }

    public function updateEmail()
    {
        $this->requireAuth();
        $data = $this->getJsonBody();
        $newEmail = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        if (!filter_var($newEmail, FILTER_VALIDATE_EMAIL)) {
            $this->errorResponse('Invalid email format');
        }

        $user = $this->userRepo->findById($this->userId);

        if (!$user || !password_verify($password, $user['password'])) {
            $this->errorResponse('Incorrect password', 401);
        }

        $existing = $this->userRepo->findByEmail($newEmail);
        if ($existing && $existing['id'] !== $this->userId) {
            $this->errorResponse('Email already in use', 409);
        }

        $token = bin2hex(random_bytes(32));

        try {
            $this->userRepo->updateEmailAndVerification($this->userId, $newEmail, $token);

            $verifyLink = FRONTEND_URL . "/verify.html?token=" . $token;
            $subject = "CyberTasker Email Update Verification";
            $body = "Operative,<br><br>Your communication channel is being re-routed to: $newEmail.<br>Confirm this frequency change:<br><a href='$verifyLink'>$verifyLink</a><br><br>Access is restricted until confirmed.";

            require_once __DIR__ . '/../mail_helper.php';
            sendMail($newEmail, $subject, $body);

            $this->jsonResponse(['success' => true, 'message' => 'Email updated. Please check your inbox to re-verify.']);
        }
        catch (Exception $e) {
            $this->errorResponse('Database error', 500);
        }
    }

    public function changePassword()
    {
        $this->requireAuth();
        $data = $this->getJsonBody();
        $currentPassword = $data['current_password'] ?? '';
        $newPassword = $data['new_password'] ?? '';

        $user = $this->userRepo->findById($this->userId);

        if ($user && password_verify($currentPassword, $user['password'])) {
            $policyCheck = $this->check_password_strength($newPassword);
            if ($policyCheck !== true) {
                $this->errorResponse('Password Policy Violation: ' . $policyCheck);
            }

            $newHash = password_hash($newPassword, PASSWORD_DEFAULT);
            $this->userRepo->updatePassword($this->userId, $newHash);
            $this->jsonResponse(['success' => true, 'message' => 'Password updated']);
        }
        else {
            $this->errorResponse('Incorrect current password', 401);
        }
    }

    public function requestPasswordReset()
    {
        $data = $this->getJsonBody();
        $email = $data['email'] ?? '';

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->errorResponse('Invalid email format');
        }

        $user = $this->userRepo->findByEmail($email);

        if ($user) {
            try {
                $token = bin2hex(random_bytes(32));
                $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));

                $this->userRepo->setPasswordResetToken($user['id'], $token, $expires);

                $resetLink = FRONTEND_URL . "/reset-password.html?token=" . $token;
                $subject = "CyberTasker Password Reset";
                $body = "Operative " . $user['username'] . ",<br><br>A request to reset your access key was received.<br>If this was you, proceed here:<br><a href='$resetLink'>$resetLink</a><br><br>This link self-destructs in 60 minutes.";

                require_once __DIR__ . '/../mail_helper.php';
                sendMail($email, $subject, $body);
            }
            catch (Exception $e) {
                error_log("Password reset database update failed: " . $e->getMessage());
            }
        }
        $this->jsonResponse(['success' => true, 'message' => 'If this email exists, a reset link has been sent.']);
    }

    public function resetPassword()
    {
        $data = $this->getJsonBody();
        $token = $data['token'] ?? '';
        $newPassword = $data['new_password'] ?? '';

        if (!$token || !$newPassword) {
            $this->errorResponse('Token and new password required');
        }

        $now = date('Y-m-d H:i:s');
        $user = $this->userRepo->findByResetToken($token, $now);

        if ($user) {
            $policyCheck = $this->check_password_strength($newPassword);
            if ($policyCheck !== true) {
                $this->errorResponse('Password Policy Violation: ' . $policyCheck);
            }

            $hash = password_hash($newPassword, PASSWORD_DEFAULT);
            $this->userRepo->updatePassword($user['id'], $hash);
            $this->userRepo->clearPasswordResetToken($user['id']);
            $this->jsonResponse(['success' => true, 'message' => 'Password reset successfully. You may now login.']);
        }
        else {
            $this->errorResponse('Invalid or expired token');
        }
    }

    public function deleteAccount()
    {
        $this->requireAuth();
        $data = $this->getJsonBody();
        $password = $data['password'] ?? '';

        $user = $this->userRepo->findById($this->userId);

        if ($user && password_verify($password, $user['password'])) {
            $this->userRepo->deleteAccount($this->userId);

            session_destroy();
            $this->jsonResponse(['success' => true, 'message' => 'Account terminated']);
        }
        else {
            $this->errorResponse('Incorrect password', 401);
        }
    }

    public function updateTheme()
    {
        $this->requireAuth();
        $data = $this->getJsonBody();
        $theme = $data['theme'] ?? 'cyberpunk';

        $allowedThemes = ['cyberpunk', 'lcars', 'matrix', 'weyland', 'robco', 'grid', 'section9', 'outrun', 'steampunk', 'force', 'arrakis', 'renaissance', 'klingon', 'got', 'marvel', 'dc'];
        if (!in_array($theme, $allowedThemes)) {
            $this->errorResponse('Invalid theme selection');
        }

        try {
            $this->userRepo->updateTheme($this->userId, $theme);
            $this->jsonResponse(['success' => true, 'theme' => $theme]);
        }
        catch (Exception $e) {
            $this->errorResponse('Failed to update theme', 500);
        }
    }

    // --- 2FA ENDPOINTS ---

    public function setup2fa()
    {
        $this->requireAuth();
        require_once __DIR__ . '/../TOTP.php';

        $user = $this->userRepo->findById($this->userId);
        $username = $user['username'];

        $secret = TOTP::generateSecret();
        $url = TOTP::getProvisioningUri($username, $secret, 'CyberTasker');

        $this->jsonResponse(['secret' => $secret, 'qr_url' => $url]);
    }

    public function enable2fa()
    {
        $this->requireAuth();
        require_once __DIR__ . '/../TOTP.php';
        $data = $this->getJsonBody();

        $secret = $data['secret'] ?? '';
        $code = $data['code'] ?? '';

        try {
            if (TOTP::verifyCode($secret, $code)) {
                $backupCodes = TOTP::generateBackupCodes();
                $hashedBackupCodes = array_map(function ($c) {
                    return password_hash(strtoupper($c), PASSWORD_DEFAULT);
                }, $backupCodes);
                $backupCodesJson = json_encode($hashedBackupCodes);

                $this->userRepo->enableTotp2fa($this->userId, $secret, $backupCodesJson);

                $this->jsonResponse(['success' => true, 'message' => '2FA Enabled', 'backup_codes' => $backupCodes]);
            }
            else {
                $this->errorResponse('Invalid Code');
            }
        }
        catch (Exception $e) {
            $this->errorResponse('Critical update failure: ' . $e->getMessage(), 500);
        }
    }

    public function setupEmail2fa()
    {
        $this->requireAuth();

        $user = $this->userRepo->findById($this->userId);

        if (!$user || !$user['email']) {
            $this->errorResponse('No email frequency found for this operative.');
        }

        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $_SESSION['email_2fa_code'] = $code;
        $_SESSION['email_2fa_time'] = time();
        $_SESSION['email_2fa_user_id'] = $this->userId;

        require_once __DIR__ . '/../mail_helper.php';
        $subject = "CYBER_TASKER // EMERGENCY OVERRIDE CODE";
        $body = "Operative " . $user['username'] . ",<br><br>An emergency override signal has been requested.<br>Use this restricted access code to bridge the neural link:<br><br><b style='font-size: 24px; letter-spacing: 5px; color: #00ffff;'>" . $code . "</b><br><br>SIGNAL DECAY DETECTED. Code self-destructs in 10 minutes.";

        if (sendMail($user['email'], $subject, $body)) {
            $this->jsonResponse(['success' => true, 'message' => 'Transmission sent. Check your secure comm-link.']);
        }
        else {
            $this->errorResponse('Transmission failed. Uplink error.', 500);
        }
    }

    public function enableEmail2fa()
    {
        $this->requireAuth();
        require_once __DIR__ . '/../TOTP.php';
        $data = $this->getJsonBody();

        $code = trim($data['code'] ?? '');
        $sessCode = $_SESSION['email_2fa_code'] ?? '';
        $sessTime = $_SESSION['email_2fa_time'] ?? 0;
        $sessUserId = $_SESSION['email_2fa_user_id'] ?? 0;

        if (!$sessCode || (time() - $sessTime > 600)) {
            $this->errorResponse('Signal expired or not found. Resend transmission.');
        }

        if ($code === $sessCode) {
            try {
                if ($sessUserId == $this->userId) {
                    unset($_SESSION['email_2fa_code']);
                    unset($_SESSION['email_2fa_time']);
                    unset($_SESSION['email_2fa_user_id']);

                    $backupCodes = TOTP::generateBackupCodes();
                    $hashedBackupCodes = array_map(function ($c) {
                        return password_hash(strtoupper($c), PASSWORD_DEFAULT);
                    }, $backupCodes);
                    $backupCodesJson = json_encode($hashedBackupCodes);

                    $this->userRepo->enableEmail2fa($this->userId, $backupCodesJson);

                    $this->jsonResponse(['success' => true, 'message' => 'Email 2FA Activated', 'backup_codes' => $backupCodes]);
                }
                else {
                    $this->errorResponse('Invalid signal code. Verification failed.');
                }
            }
            catch (Exception $e) {
                $this->errorResponse('Security protocol failure: ' . $e->getMessage(), 500);
            }
        }
        else {
            $this->errorResponse('Invalid signal code. Verification failed.');
        }
    }

    public function disable2fa()
    {
        $this->requireAuth();
        $this->userRepo->disable2fa($this->userId);
        $this->jsonResponse(['success' => true, 'message' => '2FA Disabled']);
    }

    public function verify2fa()
    {
        $data = $this->getJsonBody();
        if (!isset($_SESSION['partial_id'])) {
            $this->errorResponse('No login attempt found', 401);
        }

        require_once __DIR__ . '/../TOTP.php';

        $code = trim($data['code'] ?? '');
        $userId = $_SESSION['partial_id'];

        $user = $this->userRepo->findById($userId);

        $verified = false;

        // 1. Check Backup Codes
        if ($user['two_factor_backup_codes']) {
            $backupCodes = json_decode($user['two_factor_backup_codes'], true);
            if (is_array($backupCodes)) {
                foreach ($backupCodes as $index => $hashedCode) {
                    if (password_verify(strtoupper($code), $hashedCode)) {
                        $verified = true;
                        unset($backupCodes[$index]);
                        $newBackupCodesJson = json_encode(array_values($backupCodes));

                        $this->userRepo->updateBackupCodes($userId, $newBackupCodesJson);
                        break;
                    }
                }
            }
        }

        // 2. Check Method-specific code
        if (!$verified) {
            if ($user['two_factor_method'] === 'totp') {
                if ($user['two_factor_secret'] && TOTP::verifyCode($user['two_factor_secret'], $code)) {
                    $verified = true;
                }
            }
            elseif ($user['two_factor_method'] === 'email') {
                $sessCode = $_SESSION['email_2fa_code'] ?? '';
                $sessTime = $_SESSION['email_2fa_time'] ?? 0;
                $sessUserId = $_SESSION['email_2fa_user_id'] ?? 0;

                if ($sessCode && $sessCode === $code && $sessUserId == $userId && (time() - $sessTime <= 600)) {
                    $verified = true;
                    unset($_SESSION['email_2fa_code']);
                    unset($_SESSION['email_2fa_time']);
                    unset($_SESSION['email_2fa_user_id']);
                }
            }
        }

        if ($verified) {
            session_regenerate_id(true);
            $_SESSION['user_id'] = $userId;
            $_SESSION['role'] = $user['role'];
            unset($_SESSION['partial_id']);

            $this->userRepo->updateLastLogin($userId);

            $user = $this->userRepo->findById($userId);
            $stats = $this->userRepo->getStats($userId);

            $this->jsonResponse([
                'success' => true,
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'email' => $user['email'],
                    'role' => $user['role'],
                    'two_factor_enabled' => (bool)$user['two_factor_enabled'],
                    'two_factor_method' => $user['two_factor_method'],
                    'theme' => $user['theme'],
                    'stats' => $stats
                ],
                'csrf_token' => $_SESSION['csrf_token']
            ]);
        }
        else {
            $this->errorResponse('Invalid or expired access code. Verification failed.', 401);
        }
    }

    public function resendEmail2fa()
    {
        if (!isset($_SESSION['partial_id']) && !isset($_SESSION['user_id'])) {
            $this->errorResponse('Unauthorized', 401);
        }

        $userId = $_SESSION['partial_id'] ?? $_SESSION['user_id'];

        $user = $this->userRepo->findById($userId);

        if (!$user || $user['two_factor_method'] !== 'email') {
            $this->errorResponse('Email security not active for this operative.');
        }

        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $_SESSION['email_2fa_code'] = $code;
        $_SESSION['email_2fa_time'] = time();
        $_SESSION['email_2fa_user_id'] = $userId;

        require_once __DIR__ . '/../mail_helper.php';
        $subject = "CYBER_TASKER // EMERGENCY OVERRIDE CODE";
        $body = "Operative " . $user['username'] . ",<br><br>A new emergency override signal has been requested.<br>Use this restricted access code to bridge the neural link:<br><br><b style='font-size: 24px; letter-spacing: 5px; color: #00ffff;'>" . $code . "</b><br><br>SIGNAL DECAY DETECTED. Code self-destructs in 10 minutes.";

        if (sendMail($user['email'], $subject, $body)) {
            $this->jsonResponse(['success' => true, 'message' => 'Transmission re-sent. Check your secure comm-link.']);
        }
        else {
            $this->errorResponse('Transmission failed. Uplink error.', 500);
        }
    }
}