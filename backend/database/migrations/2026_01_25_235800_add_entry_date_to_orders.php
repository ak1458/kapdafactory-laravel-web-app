<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Add entry_date column to orders table.
     * entry_date: When the order was entered in the system (can be backdated)
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->date('entry_date')->nullable()->after('delivery_date');
        });

        // Set existing orders' entry_date to their created_at date
        DB::statement('UPDATE orders SET entry_date = DATE(created_at) WHERE entry_date IS NULL');
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('entry_date');
        });
    }
};
