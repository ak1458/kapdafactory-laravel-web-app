<?php

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Check for maintenance mode
if (file_exists(__DIR__.'/backend/storage/framework/maintenance.php')) {
    require __DIR__.'/backend/storage/framework/maintenance.php';
}

// Autoload
require __DIR__.'/backend/vendor/autoload.php';

// Bootstrap Laravel
$app = require_once __DIR__.'/backend/bootstrap/app.php';

$kernel = $app->make(Kernel::class);

$response = $kernel->handle(
    $request = Request::capture()
)->send();

$kernel->terminate($request, $response);
