<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

// Serve files from storage (for when symlinks don't work)
// FIXED: Sanitized path to prevent directory traversal
Route::get('/storage/{path}', function ($path) {
    // Reject any path containing directory traversal attempts
    if (preg_match('/\.\./', $path) || preg_match('/^\//', $path)) {
        abort(403, 'Invalid path');
    }

    // Normalize the path and ensure it stays within public storage
    $safePath = 'public/' . ltrim($path, '/');

    if (! Storage::exists($safePath)) {
        abort(404);
    }
    return Storage::download($safePath);
})->where('path', '^[a-zA-Z0-9/_.-]+$');  // Restrict to safe characters only

// SPA fallback - exclude api routes
Route::get('/{any}', function () {
    return view('app');
})->where('any', '^(?!api).*$');
