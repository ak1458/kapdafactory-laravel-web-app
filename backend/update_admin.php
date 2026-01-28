<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

// Create or update admin user
$user = User::updateOrCreate(
    ['email' => 'admin@admin.com'],
    [
        'name' => 'Admin',
        'email' => 'admin@admin.com',
        'password' => Hash::make('admin'),
    ]
);

echo "User updated/created successfully!\n";
echo "Email: admin@admin.com\n";
echo "Password: admin\n";
