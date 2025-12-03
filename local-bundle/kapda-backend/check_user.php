<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = User::where('email', 'admin@kapda.com')->first();

if ($user) {
    echo "User found: " . $user->name . "\n";
    $user->password = Hash::make('StrongPass123');
    $user->save();
    echo "Password reset to 'StrongPass123' successfully.\n";
} else {
    echo "User NOT found. Creating user...\n";
    User::create([
        'name' => 'Admin',
        'email' => 'admin@kapda.com',
        'password' => Hash::make('StrongPass123'),
        'role' => 'admin',
    ]);
    echo "User created with password 'StrongPass123'.\n";
}
