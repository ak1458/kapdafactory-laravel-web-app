<?php

use Illuminate\Support\Facades\Auth;
use App\Models\User;

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$email = 'admin@kapda.com';
$password = 'StrongPass123';

echo "Testing login for: $email / $password\n";

if (Auth::attempt(['email' => $email, 'password' => $password])) {
    echo "SUCCESS: Auth::attempt returned true.\n";
    $user = Auth::user();
    echo "Logged in as: " . $user->name . " (ID: " . $user->id . ")\n";
} else {
    echo "FAILURE: Auth::attempt returned false.\n";
    $user = User::where('email', $email)->first();
    if ($user) {
        echo "User exists in DB.\n";
        echo "Stored Hash: " . $user->password . "\n";
        echo "Hash Check: " . (password_verify($password, $user->password) ? 'Pass' : 'Fail') . "\n";
    } else {
        echo "User does NOT exist in DB.\n";
    }
}
