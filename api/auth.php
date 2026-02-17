<?php
// auth.php
require_once 'db.php';
require_once 'TOTP.php';

header("Content-Type: application/json");
session_start();

$pdo = getDBConnection();
$data = json_decode(file_get_contents("php://input"), true);
$action = $_GET['action'] ?? '';

// --- 2FA ACTIONS ---

// Helper: Check Password Strength
function check_password_strength($password, $pdo)
{
    // 1. Check if policy is enabled
    $stmt = $pdo->prepare("SELECT setting_value FROM system_settings WHERE setting_key = 'strict_password_policy'");
    $stmt->execute();
    $result = $stmt->fetch();

    // Default to strict off if not set
    $isStrict = ($result && $result['setting_value'] === '1');

    if (!$isStrict) {
        return true; // Any password allowed
    }

    // 2. Validate against rules
    // Min 12, 1 Upper, 1 Number, 1 Special
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

if ($action === 'setup_2fa') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT username FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $username = $stmt->fetchColumn();

    $secret = TOTP::generateSecret();
    $url = TOTP::getProvisioningUri($username, $secret, 'CyberTasker');

    echo json_encode(['secret' => $secret, 'qr_url' => $url]);
}

elseif ($action === 'enable_2fa') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }

    $secret = $data['secret'] ?? '';
    $code = $data['code'] ?? '';

    try {
        if (TOTP::verifyCode($secret, $code)) {
            // Generate backup codes
            $backupCodes = TOTP::generateBackupCodes();
            $hashedBackupCodes = array_map(function ($c) {
                return password_hash(strtoupper($c), PASSWORD_DEFAULT);
            }, $backupCodes);
            $backupCodesJson = json_encode($hashedBackupCodes);

            $stmt = $pdo->prepare("UPDATE users SET two_factor_secret = ?, two_factor_enabled = 1, two_factor_method = 'totp', two_factor_backup_codes = ? WHERE id = ?");
            $stmt->execute([$secret, $backupCodesJson, $_SESSION['user_id']]);

            echo json_encode(['success' => true, 'message' => '2FA Enabled', 'backup_codes' => $backupCodes]);
        }
        else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid Code']);
        }
    }
    catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Critical update failure: ' . $e->getMessage()]);
    }
}

elseif ($action === 'setup_email_2fa') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT email, username FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();

    if (!$user || !$user['email']) {
        http_response_code(400);
        echo json_encode(['error' => 'No email frequency found for this operative.']);
        exit;
    }

    $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    $_SESSION['email_2fa_code'] = $code;
    $_SESSION['email_2fa_time'] = time();
    $_SESSION['email_2fa_user_id'] = $_SESSION['user_id'];

    require_once 'mail_helper.php';
    $subject = "CYBER_TASKER // EMERGENCY OVERRIDE CODE";
    $body = "Operative " . $user['username'] . ",<br><br>An emergency override signal has been requested.<br>Use this restricted access code to bridge the neural link:<br><br><b style='font-size: 24px; letter-spacing: 5px; color: #00ffff;'>" . $code . "</b><br><br>SIGNAL DECAY DETECTED. Code self-destructs in 10 minutes.";

    if (sendMail($user['email'], $subject, $body)) {
        echo json_encode(['success' => true, 'message' => 'Transmission sent. Check your secure comm-link.']);
    }
    else {
        http_response_code(500);
        echo json_encode(['error' => 'Transmission failed. Uplink error.']);
    }
}

elseif ($action === 'enable_email_2fa') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }

    $code = $data['code'] ?? '';
    $sessCode = $_SESSION['email_2fa_code'] ?? '';
    $sessTime = $_SESSION['email_2fa_time'] ?? 0;

    if (!$sessCode || (time() - $sessTime > 600)) {
        http_response_code(400);
        echo json_encode(['error' => 'Signal expired or not found. Resend transmission.']);
        exit;
    }

    if ($code === $sessCode) {
        try {
            // The condition here is more comprehensive, checking session code, user ID, and time
            if ($sessCode && $sessCode === $code && $sessUserId == $_SESSION['user_id'] && (time() - $sessTime <= 600)) {
                unset($_SESSION['email_2fa_code']);
                unset($_SESSION['email_2fa_time']);
                unset($_SESSION['email_2fa_user_id']); // Unset the user ID as well

                // Generate backup codes
                $backupCodes = TOTP::generateBackupCodes();
                $hashedBackupCodes = array_map(function ($c) {
                    return password_hash(strtoupper($c), PASSWORD_DEFAULT);
                }, $backupCodes);
                $backupCodesJson = json_encode($hashedBackupCodes);

                $stmt = $pdo->prepare("UPDATE users SET two_factor_enabled = 1, two_factor_method = 'email', two_factor_secret = NULL, two_factor_backup_codes = ? WHERE id = ?");
                $stmt->execute([$backupCodesJson, $_SESSION['user_id']]);

                echo json_encode(['success' => true, 'message' => 'Email 2FA Activated', 'backup_codes' => $backupCodes]);
            }
            else {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid signal code. Verification failed.']);
            }
        }
        catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Security protocol failure: ' . $e->getMessage()]);
        }
    }
    else { // This 'else' block belongs to the outer 'if ($code === $sessCode)'
        http_response_code(400);
        echo json_encode(['error' => 'Invalid signal code. Verification failed.']);
    }
}

elseif ($action === 'disable_2fa') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }

    // Optional: Verify password before disabling (Skipping for now as per "simple button" request, but can be added if needed)

    $stmt = $pdo->prepare("UPDATE users SET two_factor_enabled = 0, two_factor_secret = NULL, two_factor_method = NULL, two_factor_backup_codes = NULL WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    echo json_encode(['success' => true, 'message' => '2FA Disabled']);
}

elseif ($action === 'verify_2fa') {
    if (!isset($_SESSION['partial_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'No login attempt found']);
        exit;
    }

    $code = $data['code'] ?? '';
    $userId = $_SESSION['partial_id'];

    $stmt = $pdo->prepare("SELECT two_factor_secret, two_factor_method, two_factor_backup_codes FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    $verified = false;

    // 1. Check Backup Codes
    if ($user['two_factor_backup_codes']) {
        $backupCodes = json_decode($user['two_factor_backup_codes'], true);
        if (is_array($backupCodes)) {
            foreach ($backupCodes as $index => $hashedCode) {
                if (password_verify(strtoupper($code), $hashedCode)) {
                    $verified = true;
                    // Consume the code
                    unset($backupCodes[$index]);
                    $newBackupCodesJson = json_encode(array_values($backupCodes));
                    $pdo->prepare("UPDATE users SET two_factor_backup_codes = ? WHERE id = ?")->execute([$newBackupCodesJson, $userId]);
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
        // Promote to full session
        $_SESSION['user_id'] = $userId;
        unset($_SESSION['partial_id']);

        // Record Last Login
        $pdo->prepare("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?")->execute([$userId]);

        // Fetch user data for response
        $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        $stmtStats = $pdo->prepare("SELECT * FROM user_stats WHERE id = ?");
        $stmtStats->execute([$userId]);
        $stats = $stmtStats->fetch();

        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'role' => $user['role'],
                'two_factor_enabled' => (bool)$user['two_factor_enabled'],
                'two_factor_method' => $user['two_factor_method'],
                'stats' => $stats
            ]
        ]);
    }
    else {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid or expired access code. Verification failed.']);
    }
}

elseif ($action === 'resend_email_2fa') {
    if (!isset($_SESSION['partial_id']) && !isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }

    $userId = $_SESSION['partial_id'] ?? $_SESSION['user_id'];

    $stmt = $pdo->prepare("SELECT email, username, two_factor_method FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user || $user['two_factor_method'] !== 'email') {
        http_response_code(400);
        echo json_encode(['error' => 'Email security not active for this operative.']);
        exit;
    }

    $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    $_SESSION['email_2fa_code'] = $code;
    $_SESSION['email_2fa_time'] = time();
    $_SESSION['email_2fa_user_id'] = $userId;

    require_once 'mail_helper.php';
    $subject = "CYBER_TASKER // EMERGENCY OVERRIDE CODE";
    $body = "Operative " . $user['username'] . ",<br><br>A new emergency override signal has been requested.<br>Use this restricted access code to bridge the neural link:<br><br><b style='font-size: 24px; letter-spacing: 5px; color: #00ffff;'>" . $code . "</b><br><br>SIGNAL DECAY DETECTED. Code self-destructs in 10 minutes.";

    if (sendMail($user['email'], $subject, $body)) {
        echo json_encode(['success' => true, 'message' => 'Transmission re-sent. Check your secure comm-link.']);
    }
    else {
        http_response_code(500);
        echo json_encode(['error' => 'Transmission failed. Uplink error.']);
    }
}

// --- STANDARD AUTH ACTIONS ---

elseif ($action === 'register') {
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';
    $email = $data['email'] ?? '';

    if (!$username || !$password || !$email) {
        http_response_code(400);
        echo json_encode(['error' => 'Username, password, and email required']);
        exit;
    }

    // Check Password Policy
    $policyCheck = check_password_strength($password, $pdo);
    if ($policyCheck !== true) {
        http_response_code(400);
        echo json_encode(['error' => 'Password Policy Violation: ' . $policyCheck]);
        exit;
    }

    // Validate Email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid email format']);
        exit;
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);
    $verificationToken = bin2hex(random_bytes(32));

    try {
        $stmt = $pdo->prepare("INSERT INTO users (username, password, email, verification_token, is_verified) VALUES (?, ?, ?, ?, 0)");
        $stmt->execute([$username, $hash, $email, $verificationToken]);
        $userId = $pdo->lastInsertId();

        // Initialize Stats (Use prepared statement)
        $stmtStats = $pdo->prepare("INSERT INTO user_stats (id, total_points, current_level, badges_json) VALUES (?, 0, 1, '[]')");
        $stmtStats->execute([$userId]);

        // [New] Seed Categories (Use prepared statement)
        $categoriesSql = "INSERT INTO user_categories (user_id, name, is_default) VALUES 
            (?, 'Private', 1),
            (?, 'Work', 0),
            (?, 'Health', 0),
            (?, 'Finance', 0),
            (?, 'Hobby', 0)";
        $stmtCats = $pdo->prepare($categoriesSql);
        $stmtCats->execute([$userId, $userId, $userId, $userId, $userId]);

        // [New] Insert Onboarding Tasks (Use prepared statement)
        $tasksSql = "INSERT INTO tasks (user_id, title, category, priority, points_value) VALUES 
            (?, 'Debug Neural Link Interface', 'Work', 2, 15),
            (?, 'Hack Coffee Machine Subnet', 'Work', 2, 15),
            (?, 'Feed the Techno-Cat', 'Private', 3, 10),
            (?, 'Install Sleep.exe Patch', 'Health', 1, 20)";
        $stmtTasks = $pdo->prepare($tasksSql);
        $stmtTasks->execute([$userId, $userId, $userId, $userId]);

        // Send Verification Email
        $mailSuccess = false;
        try {
            require_once 'mail_helper.php';
            $verifyLink = FRONTEND_URL . "/verify.html?token=" . $verificationToken;
            $subject = "CyberTasker Identity Verification";
            $body = "Welcome Operative $username.<br><br>To access the system, you must verify your com-link:<br><a href='$verifyLink'>$verifyLink</a><br><br>This link expires in... never (for now).";
            $mailSuccess = sendMail($email, $subject, $body);
        }
        catch (Throwable $e) {
            // Log error but don't crash registration
            error_log("Registration mail failed: " . $e->getMessage());
        }

        if ($mailSuccess) {
            echo json_encode(['success' => true, 'message' => 'User registered. Please check email to verify.']);
        }
        else {
            echo json_encode(['success' => true, 'message' => 'Identity established, but com-link signal failed. Contact Admin to verify your account manually.']);
        }
    }

    catch (PDOException $e) {
        http_response_code(409);
        echo json_encode(['error' => 'Username or Email already exists']);
    }
}

elseif ($action === 'update_email') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }

    $userId = $_SESSION['user_id'];
    $newEmail = $data['email'] ?? '';
    $password = $data['password'] ?? '';

    if (!filter_var($newEmail, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid email format']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT password FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Incorrect password']);
        exit;
    }

    // Check if email taken
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
    $stmt->execute([$newEmail, $userId]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'Email already in use']);
        exit;
    }

    $token = bin2hex(random_bytes(32));

    try {
        $update = $pdo->prepare("UPDATE users SET email = ?, is_verified = 0, verification_token = ? WHERE id = ?");
        $update->execute([$newEmail, $token, $userId]);

        require_once 'mail_helper.php';
        $verifyLink = FRONTEND_URL . "/verify.html?token=" . $token;
        $subject = "CyberTasker Email Update Verification";
        $body = "Operative,<br><br>Your communication channel is being re-routed to: $newEmail.<br>Confirm this frequency change:<br><a href='$verifyLink'>$verifyLink</a><br><br>Access is restricted until confirmed.";

        sendMail($newEmail, $subject, $body);

        echo json_encode(['success' => true, 'message' => 'Email updated. Please check your inbox to re-verify.']);
    }
    catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error']);
    }
}

elseif ($action === 'verify_email') {
    $token = $data['token'] ?? '';

    if (!$token) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing token']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT id FROM users WHERE verification_token = ?");
    $stmt->execute([$token]);
    $user = $stmt->fetch();

    if ($user) {
        $update = $pdo->prepare("UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?");
        $update->execute([$user['id']]);
        echo json_encode(['success' => true, 'message' => 'Account verified! You can now login.']);
    }
    else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid or expired token']);
    }
}

elseif ($action === 'login') {
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';

    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? OR email = ?");
    $stmt->execute([$username, $username]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {

        // Check Verification Status (Phase 2)
        if (isset($user['is_verified']) && $user['is_verified'] == 0) {
            http_response_code(403);
            echo json_encode(['error' => 'Account not verified. Please check your email.']);
            exit;
        }

        // Check 2FA
        if ($user['two_factor_enabled']) {
            $_SESSION['partial_id'] = $user['id'];

            if ($user['two_factor_method'] === 'email') {
                // Trigger email code
                $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
                $_SESSION['email_2fa_code'] = $code;
                $_SESSION['email_2fa_time'] = time();
                $_SESSION['email_2fa_user_id'] = $user['id'];

                require_once 'mail_helper.php';
                $subject = "CYBER_TASKER // EMERGENCY OVERRIDE CODE";
                $body = "Operative " . $user['username'] . ",<br><br>A restricted access signal is required for neural link establishment.<br>Use this code to verify your identity:<br><br><b style='font-size: 24px; letter-spacing: 5px; color: #00ffff;'>" . $code . "</b><br><br>SIGNAL DECAY DETECTED. Code self-destructs in 10 minutes.";
                sendMail($user['email'], $subject, $body);
            }

            echo json_encode(['success' => true, 'requires_2fa' => true, 'two_factor_method' => $user['two_factor_method']]);
            exit;
        }

        // Standard Login
        $_SESSION['user_id'] = $user['id'];

        // Record Last Login
        $pdo->prepare("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?")->execute([$user['id']]);

        $stmtStats = $pdo->prepare("SELECT * FROM user_stats WHERE id = ?");
        $stmtStats->execute([$user['id']]);
        $stats = $stmtStats->fetch();

        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'role' => $user['role'],
                'two_factor_enabled' => (bool)$user['two_factor_enabled'],
                'stats' => $stats
            ]
        ]);
    }
    else {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
    }

}
elseif ($action === 'logout') {
    session_destroy();
    echo json_encode(['success' => true]);
}
elseif ($action === 'change_password') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }

    $userId = $_SESSION['user_id'];
    $currentPassword = $data['current_password'] ?? '';
    $newPassword = $data['new_password'] ?? '';

    $stmt = $pdo->prepare("SELECT password FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if ($user && password_verify($currentPassword, $user['password'])) {
        // Check Password Policy
        $policyCheck = check_password_strength($newPassword, $pdo);
        if ($policyCheck !== true) {
            http_response_code(400);
            echo json_encode(['error' => 'Password Policy Violation: ' . $policyCheck]);
            exit;
        }

        $newHash = password_hash($newPassword, PASSWORD_DEFAULT);
        $updateStmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
        $updateStmt->execute([$newHash, $userId]);
        echo json_encode(['success' => true, 'message' => 'Password updated']);
    }
    else {
        http_response_code(401);
        echo json_encode(['error' => 'Incorrect current password']);
    }

}
elseif ($action === 'delete_account') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }

    $userId = $_SESSION['user_id'];
    $password = $data['password'] ?? '';

    $stmt = $pdo->prepare("SELECT password FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        $pdo->prepare("DELETE FROM tasks WHERE user_id = ?")->execute([$userId]);
        $pdo->prepare("DELETE FROM user_categories WHERE user_id = ?")->execute([$userId]);
        $pdo->prepare("DELETE FROM user_stats WHERE id = ?")->execute([$userId]);
        $pdo->prepare("DELETE FROM users WHERE id = ?")->execute([$userId]);

        session_destroy();
        echo json_encode(['success' => true, 'message' => 'Account terminated']);
    }
    else {
        http_response_code(401);
        echo json_encode(['error' => 'Incorrect password']);
    }

}
elseif ($action === 'request_password_reset') {
    $email = $data['email'] ?? '';

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid email format']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT id, username FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user) {
        $token = bin2hex(random_bytes(32));

        $update = $pdo->prepare("UPDATE users SET reset_token = ?, reset_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id = ?");
        $update->execute([$token, $user['id']]);

        require_once 'mail_helper.php';
        $resetLink = FRONTEND_URL . "/reset-password.html?token=" . $token;
        $subject = "CyberTasker Password Reset";
        $body = "Operative " . $user['username'] . ",<br><br>A request to reset your access key was received.<br>If this was you, proceed here:<br><a href='$resetLink'>$resetLink</a><br><br>This link self-destructs in 60 minutes.";

        sendMail($email, $subject, $body);
    }

    // Always return success to prevent email enumeration
    echo json_encode(['success' => true, 'message' => 'If this email exists, a reset link has been sent.']);
}

elseif ($action === 'reset_password') {
    $token = $data['token'] ?? '';
    $newPassword = $data['new_password'] ?? '';

    if (!$token || !$newPassword) {
        http_response_code(400);
        echo json_encode(['error' => 'Token and new password required']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT id FROM users WHERE reset_token = ? AND reset_expires > NOW()");
    $stmt->execute([$token]);
    $user = $stmt->fetch();

    if ($user) {
        // Check Password Policy
        $policyCheck = check_password_strength($newPassword, $pdo);
        if ($policyCheck !== true) {
            http_response_code(400);
            echo json_encode(['error' => 'Password Policy Violation: ' . $policyCheck]);
            exit;
        }

        $hash = password_hash($newPassword, PASSWORD_DEFAULT);
        $update = $pdo->prepare("UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?");
        $update->execute([$hash, $user['id']]);
        echo json_encode(['success' => true, 'message' => 'Password reset successfully. You may now login.']);
    }
    else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid or expired token']);
    }
}

else {
    // Check Status
    if (isset($_SESSION['user_id'])) {
        $stmt = $pdo->prepare("SELECT id, username, email, role, two_factor_enabled, two_factor_method FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch();

        $stmtStats = $pdo->prepare("SELECT * FROM user_stats WHERE id = ?");
        $stmtStats->execute([$_SESSION['user_id']]);
        $stats = $stmtStats->fetch();

        if ($user) {
            echo json_encode([
                'isAuthenticated' => true,
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'email' => $user['email'], // [NEW]
                    'role' => $user['role'],
                    'two_factor_enabled' => (bool)$user['two_factor_enabled'],
                    'two_factor_method' => $user['two_factor_method'],
                    'stats' => $stats
                ]
            ]);
            exit;
        }
    }
    echo json_encode(['isAuthenticated' => false]);
}