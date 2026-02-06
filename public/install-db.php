<?php

/**
 * KapdaFactory Database Installer
 * Access this file at: https://your-domain.com/install-db.php
 * DELETE THIS FILE AFTER RUNNING MIGRATIONS!
 */

// Basic security - only run if key matches
$securityKey = 'kapdafactory2026';
if (!isset($_GET['key']) || $_GET['key'] !== $securityKey) {
    die('Access denied. Use: ?key=' . $securityKey);
}

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "<html><head><title>KapdaFactory Installer</title>";
echo "<style>body{font-family:system-ui;padding:40px;max-width:800px;margin:auto;background:#f5f5f5}";
echo ".box{background:white;padding:20px;border-radius:12px;margin:20px 0;box-shadow:0 2px 10px rgba(0,0,0,0.1)}";
echo ".success{color:green}.error{color:red}pre{background:#1a1a1a;color:#0f0;padding:15px;border-radius:8px;overflow:auto}</style></head><body>";
echo "<h1>🧵 KapdaFactory Installer</h1>";

$action = $_GET['action'] ?? 'menu';

if ($action === 'menu') {
    echo "<div class='box'>";
    echo "<h2>Choose Action:</h2>";
    echo "<p><a href='?key=$securityKey&action=migrate'>1. Run Migrations (Create Tables)</a></p>";
    echo "<p><a href='?key=$securityKey&action=seed'>2. Seed Database (Create Admin User)</a></p>";
    echo "<p><a href='?key=$securityKey&action=fresh'>3. Fresh Install (Drop All + Migrate + Seed)</a></p>";
    echo "<p><a href='?key=$securityKey&action=link'>4. Create Storage Link</a></p>";
    echo "</div>";
}

if ($action === 'migrate') {
    echo "<div class='box'><h2>Running Migrations...</h2><pre>";
    try {
        Artisan::call('migrate', ['--force' => true]);
        echo Artisan::output();
        echo "</pre><p class='success'>✅ Migrations completed!</p></div>";
    } catch (Exception $e) {
        echo "</pre><p class='error'>❌ Error: " . $e->getMessage() . "</p></div>";
    }
}

if ($action === 'seed') {
    echo "<div class='box'><h2>Seeding Database...</h2><pre>";
    try {
        Artisan::call('db:seed', ['--force' => true]);
        echo Artisan::output();
        echo "</pre><p class='success'>✅ Seeding completed!</p>";
        echo "<p>Login: admin@admin.com / admin</p></div>";
    } catch (Exception $e) {
        echo "</pre><p class='error'>❌ Error: " . $e->getMessage() . "</p></div>";
    }
}

if ($action === 'fresh') {
    echo "<div class='box'><h2>Fresh Install...</h2><pre>";
    try {
        Artisan::call('migrate:fresh', ['--seed' => true, '--force' => true]);
        echo Artisan::output();
        echo "</pre><p class='success'>✅ Fresh install completed!</p>";
        echo "<p>Login: admin@admin.com / admin</p></div>";
    } catch (Exception $e) {
        echo "</pre><p class='error'>❌ Error: " . $e->getMessage() . "</p></div>";
    }
}

if ($action === 'link') {
    echo "<div class='box'><h2>Creating Storage Link...</h2><pre>";
    try {
        Artisan::call('storage:link', ['--force' => true]);
        echo Artisan::output();
        echo "</pre><p class='success'>✅ Storage link created!</p></div>";
    } catch (Exception $e) {
        echo "</pre><p class='error'>❌ Error: " . $e->getMessage() . "</p></div>";
    }
}

echo "<div class='box'><a href='?key=$securityKey&action=menu'>← Back to Menu</a></div>";
echo "<p style='color:#999;text-align:center'>⚠️ DELETE THIS FILE AFTER SETUP!</p>";
echo "</body></html>";
