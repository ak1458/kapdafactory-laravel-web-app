<?php

/**
 * Reset Admin Password
 * Sets password to: admin123
 */

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$email = 'admin@admin.com';
$newPassword = 'admin123';

$user = User::where('email', $email)->first();

if ($user) {
    $user->password = Hash::make($newPassword);
    $user->save();
    echo "✓ Password reset successfully for: {$email}\n";
    echo "✓ New password: {$newPassword}\n";
} else {
    echo "✗ User not found: {$email}\n";
}
