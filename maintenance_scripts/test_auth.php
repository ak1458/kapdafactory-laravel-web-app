<?php

/**
 * Test Login API
 */

// Load Laravel bootstrap
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

echo "=== Authentication Test ===\n\n";

// Check users
$users = User::all();
echo "Users in database: " . $users->count() . "\n";

foreach ($users as $user) {
    echo "  - ID: {$user->id}, Email: {$user->email}, Role: {$user->role}\n";
}

// Test password verification
$testEmail = 'admin@kapdafactory.in';
$testPassword = 'admin123';

$user = User::where('email', $testEmail)->first();
if ($user) {
    echo "\nTesting password for: {$testEmail}\n";
    $valid = Hash::check($testPassword, $user->password);
    echo "Password 'admin123' valid: " . ($valid ? 'YES' : 'NO') . "\n";

    if (!$valid) {
        // Try other common passwords
        $passwords = ['password', '123456', 'admin', 'test123'];
        foreach ($passwords as $pwd) {
            if (Hash::check($pwd, $user->password)) {
                echo "Password '{$pwd}' is valid!\n";
                break;
            }
        }
    }
} else {
    echo "\nNo user found with email: {$testEmail}\n";
    echo "Available emails:\n";
    foreach ($users as $u) {
        echo "  - {$u->email}\n";
    }
}

echo "\nDone.\n";
