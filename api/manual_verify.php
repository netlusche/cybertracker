<?php
// manual_verify.php
require_once 'db.php';

// Users to verify automatically
$usersToVerify = ['Frank', 'Herbert', 'frank', 'tester', 'testuser'];

echo "<h3>Manual User Verification</h3>";

try {
    $pdo = getDBConnection();

    $stmt = $pdo->prepare("UPDATE users SET is_verified = 1 WHERE username = ?");

    foreach ($usersToVerify as $username) {
        $stmt->execute([$username]);
        if ($stmt->rowCount() > 0) {
            echo "User <strong>$username</strong> verified successfully.<br>";
        }
        else {
            echo "User <strong>$username</strong> not found or already verified.<br>";
        }
    }
    echo "<br>Done.";

}
catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>