<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$count = DB::table('order_images')->count();
echo "Total records in order_images table: $count\n";

$last = DB::table('order_images')->orderBy('id', 'desc')->first();
if ($last) {
    echo "Last Image Record: ID={$last->id}, OrderID={$last->order_id}, File={$last->filename}\n";
} else {
    echo "Table is empty.\n";
}
