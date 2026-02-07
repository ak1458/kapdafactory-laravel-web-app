<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$orderIds = [121, 123, 125, 127]; // From screenshot

echo "--- SPECIFIC ORDER DEBUG ---\n";

foreach ($orderIds as $id) {
    echo "\nChecking Order #$id:\n";
    $images = DB::table('order_images')->where('order_id', $id)->get();

    if ($images->isEmpty()) {
        echo "  [NO RECORD] No image records found in DB.\n";
    } else {
        foreach ($images as $img) {
            $path = $img->filename;
            $fullPath = storage_path('app/public/' . $path);
            echo "  [RECORD FOUND] ID: {$img->id} | Path: $path\n";

            if (file_exists($fullPath)) {
                echo "    [DISK: OK] File exists. URL: " . asset('storage/' . $path) . "\n";
            } else {
                echo "    [DISK: FAIL] File MISSING at $fullPath\n";
            }
        }
    }
}
echo "--- END ---\n";
