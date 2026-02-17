<?php
// api/mail_helper.php

function sendMail($to, $subject, $body)
{
    if (!$to)
        return false;

    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: CyberTasker <no-reply@" . ($_SERVER['HTTP_HOST'] ?? 'localhost') . ">" . "\r\n";
    $headers .= "Reply-To: no-reply@" . ($_SERVER['HTTP_HOST'] ?? 'localhost') . "\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();

    // Wrap body in a simple HTML template
    $htmlMessage = "
    <html>
    <head>
        <title>$subject</title>
        <style>
            body { font-family: 'Courier New', monospace; background-color: #0d0d0d; color: #00ff9d; padding: 20px; }
            .container { border: 1px solid #00ff9d; padding: 20px; max-width: 600px; margin: 0 auto; }
            h1 { border-bottom: 1px solid #00ff9d; padding-bottom: 10px; }
            .footer { margin-top: 20px; font-size: 0.8em; color: #555; border-top: 1px dashed #333; padding-top: 10px; }
            a { color: #00ffff; text-decoration: none; }
            a:hover { text-decoration: underline; }
        </style>
    </head>
    <body>
        <div class='container'>
            <h1>CYBER TASKER // TRANSMISSION</h1>
            <p>$body</p>
            <div class='footer'>
                SECURE CHANNEL ESTABLISHED.<br>
                ORIGIN: CYBER_TASKER_CORE
            </div>
        </div>
    </body>
    </html>
    ";

    // For local development, log the mail to a file and system log
    /*
     $logEntry = "\n--- EMAIL TRANSMISSION ---\nTo: $to\nSubject: $subject\nBody: " . strip_tags($body) . "\n-------------------------\n";
     file_put_contents(__DIR__ . '/mail_log.txt', $logEntry, FILE_APPEND);
     error_log($logEntry);
     */

    return mail($to, $subject, $htmlMessage, $headers);
}