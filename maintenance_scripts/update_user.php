<?php
require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;

$user = User::first();
if ($user) {
    $user->email = 'kapda@factory.in';
    $user->password = bcrypt('Kapda@2026');
    $user->save();
    echo "User updated successfully!\n";
    echo "Email: " . $user->email . "\n";
} else {
    echo "No user found in database\n";
}
