<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ImageController;
use App\Http\Controllers\ExportController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Orders (Protected)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::put('/orders/{id}', [OrderController::class, 'update']);
    Route::delete('/orders/{id}', [OrderController::class, 'destroy']);
    Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
    Route::post('/orders/{id}/payments', [OrderController::class, 'addPayment']);
    Route::get('/daily-collections', [OrderController::class, 'dailyCollections']);

    // Images
    Route::post('/orders/{id}/images', [ImageController::class, 'store']);
    Route::delete('/orders/{id}/images/{imageId}', [ImageController::class, 'destroy']);

    // Export - FIXED: Now requires authentication
    Route::get('/export/orders', [ExportController::class, 'exportOrders']);
    Route::get('/export/collections', [ExportController::class, 'exportCollections']);
});
