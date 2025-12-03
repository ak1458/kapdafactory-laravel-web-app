<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ImageController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::put('/orders/{id}', [OrderController::class, 'update']);
    Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
    
    // Images
    Route::post('/orders/{id}/images', [ImageController::class, 'store']);
    Route::delete('/orders/{id}/images/{imageId}', [ImageController::class, 'destroy']);
    
    // Export (Simple implementation for now)
    // Route::get('/orders/export', [OrderController::class, 'export']);
});
