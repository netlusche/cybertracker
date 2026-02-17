<?php
// api/TOTP.php

class TOTP
{
    private static $base32Map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

    /**
     * Generate a random Base32 secret key (16 chars = 80 bits of entropy)
     */
    public static function generateSecret($length = 16)
    {
        $secret = '';
        for ($i = 0; $i < $length; $i++) {
            $secret .= self::$base32Map[random_int(0, 31)];
        }
        return $secret;
    }

    /**
     * Verify a given code against the secret.
     * Checks current time window and adjacent windows (+/- 1) to account for drift.
     */
    public static function verifyCode($secret, $code, $window = 1)
    {
        if (strlen($code) != 6)
            return false;

        $currentTime = floor(time() / 30);

        for ($i = -$window; $i <= $window; $i++) {
            if (self::getCode($secret, $currentTime + $i) == $code) {
                return true;
            }
        }
        return false;
    }

    /**
     * Calculate OATH-TOTP code for a specific time slice
     */
    public static function getCode($secret, $timeSlice)
    {
        // Decode Base32 Secret to Binary
        $secretKey = self::base32Decode($secret);

        // Pack time into 64-bit big-endian binary string
        $time = pack('N*', 0) . pack('N*', $timeSlice);

        // Hash it with HMAC-SHA1
        $hash = hash_hmac('sha1', $time, $secretKey, true);

        // Dynamic Truncation
        $offset = ord(substr($hash, -1)) & 0x0F;
        $hashPart = substr($hash, $offset, 4);

        $value = unpack('N', $hashPart)[1];
        $value = $value & 0x7FFFFFFF;

        $modulo = pow(10, 6);
        return str_pad($value % $modulo, 6, '0', STR_PAD_LEFT);
    }

    private static function base32Decode($secret)
    {
        $secret = strtoupper($secret);
        $binary = '';
        $buffer = 0;
        $bufferSize = 0;

        for ($i = 0; $i < strlen($secret); $i++) {
            $char = $secret[$i];
            $position = strpos(self::$base32Map, $char);
            if ($position === false)
                continue;

            $buffer = ($buffer << 5) | $position;
            $bufferSize += 5;

            if ($bufferSize >= 8) {
                $bufferSize -= 8;
                $binary .= chr(($buffer & (0xFF << $bufferSize)) >> $bufferSize);
            }
        }
        return $binary;
    }

    /**
     * Generate 8 random backup codes
     */
    public static function generateBackupCodes($count = 8, $length = 8)
    {
        $codes = [];
        $chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for ($i = 0; $i < $count; $i++) {
            $code = '';
            for ($j = 0; $j < $length; $j++) {
                $code .= $chars[random_int(0, strlen($chars) - 1)];
            }
            $codes[] = $code;
        }
        return $codes;
    }

    /**
     * Generate otpauth URL for QR Code
     */
    public static function getProvisioningUri($username, $secret, $issuer = 'CyberTasker')
    {
        return 'otpauth://totp/' . urlencode($issuer) . ':' . urlencode($username) .
            '?secret=' . $secret . '&issuer=' . urlencode($issuer);
    }
}
?>