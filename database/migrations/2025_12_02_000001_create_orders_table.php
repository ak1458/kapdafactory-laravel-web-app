<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('token', 50)->unique();
            $table->string('bill_number', 50)->nullable()->unique();
            $table->string('customer_name', 150)->nullable();
            $table->json('measurements'); // Stores chest, waist, etc.
            $table->date('delivery_date')->nullable();
            $table->enum('status', ['pending', 'ready', 'delivered', 'transferred'])->default('pending');
            $table->text('remarks')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();

            $table->index(['delivery_date', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
