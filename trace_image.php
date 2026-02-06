<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

// 1. Get Latest Order
$order = DB::table('orders')->orderBy('id', 'desc')->first();
echo "Latest Order ID: {$order->id}, Token: {$order->token}\n";

// 2. Get Images for this Order
$images = DB::table('order_images')->where('order_id', $order->id)->get();
echo "Image Records: " . $images->count() . "\n";

foreach ($images as $img) {
    echo " - DB Filename: {$img->filename}\n";

    // 3. Check Physical File (Storage Path)
    $storagePath = storage_path('app/public/' . $img->filename);
    echo " - Storage Path: $storagePath " . (file_exists($storagePath) ? "[EXISTS]" : "[MISSING]") . "\n";

    // 4. Check Public Link Path
    $publicPath = public_path('storage/' . $img->filename);
    echo " - Public Path:  $publicPath " . (file_exists($publicPath) ? "[RESOLVES]" : "[BROKEN]") . "\n";
}

echo "--- Symlink Check ---\n";
echo "Public Storage Link: " . public_path('storage') . " -> " . readlink(public_path('storage')) . "\n";
