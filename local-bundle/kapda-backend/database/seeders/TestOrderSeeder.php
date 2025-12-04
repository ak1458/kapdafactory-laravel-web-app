<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\OrderImage;
use Faker\Factory as Faker;

class TestOrderSeeder extends Seeder
{
    public function run()
    {
        $order = Order::updateOrCreate(
            ['id' => 999],
            [
                'token' => 'TEST-IMG',
                'status' => 'pending',
                'created_by' => 1,
                'customer_name' => 'Test Customer',
                'delivery_date' => now()->addDays(5),
                'measurements' => [],
            ]
        );

        $order->images()->create([
            'filename' => 'uploads/orders/999/test.png',
            'mime' => 'image/png',
            'size' => 1000,
        ]);

        $this->command->info('Test Order 999 created with image.');

        // Generate 50 dummy orders
        $faker = Faker::create();
        $statuses = ['pending', 'ready', 'delivered', 'transferred'];

        for ($i = 0; $i < 50; $i++) {
            Order::create([
                'token' => $faker->unique()->numerify('ORD-####'),
                'bill_number' => $faker->optional()->numerify('BILL-####'),
                'customer_name' => $faker->name,
                'delivery_date' => $faker->dateTimeBetween('-1 month', '+1 month'),
                'status' => $faker->randomElement($statuses),
                'remarks' => $faker->optional()->sentence,
                'measurements' => [],
                'created_by' => 1,
            ]);
        }

        $this->command->info('50 Dummy Orders created.');
    }
}
