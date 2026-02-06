<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

// Serve files from storage (for when symlinks don't work)
Route::get('/storage/{path}', function ($path) {
    if (! Storage::exists('public/' . $path)) {
        abort(404);
    }
    return Storage::download('public/' . $path);
})->where('path', '.*');

// SPA fallback - exclude api routes
Route::get('/{any}', function () {
    return view('app');
})->where('any', '^(?!api).*$');
