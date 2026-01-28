<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

// Serve files from storage (for when symlinks don't work)
Route::get('/storage/{path}', function ($path) {
    $fullPath = storage_path('app/public/' . $path);

    if (!file_exists($fullPath)) {
        abort(404);
    }

    $mimeType = mime_content_type($fullPath);
    return response()->file($fullPath, ['Content-Type' => $mimeType]);
})->where('path', '.*');

Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
