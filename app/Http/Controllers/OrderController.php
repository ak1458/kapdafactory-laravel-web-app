<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with('images')->filter($request->all());

        // Apply date filter if provided (for Dashboard Daily Summary)
        $additional_data = [];
        if ($request->has('date')) {

            // Calculate daily stats using efficient DB aggregates (Single Query)
            // We clone the base query which already has the date filter applied by scopeFilter
            $stats = (clone $query)->selectRaw("
                COUNT(*) as total_orders,
                SUM(CASE WHEN status = 'delivered' THEN total_amount ELSE 0 END) as total_collection,
                SUM(CASE WHEN status NOT IN ('delivered', 'transferred') THEN total_amount ELSE 0 END) as total_pending,
                SUM(CASE WHEN (total_amount - (SELECT COALESCE(SUM(amount),0) FROM payments WHERE payments.order_id = orders.id)) <= 0 THEN 1 ELSE 0 END) as dues_cleared
            ")->first();

            // Note: balance calculation in SQL (subquery) is heavy if the table is huge, 
            // but for a single day (date filter applied), it's very fast.
            // The logic: balance = total - paid. If balance <= 0, it's 'dues_cleared'.

            $total_orders = $stats->total_orders;
            $total_collection = $stats->total_collection ?? 0;
            $total_pending = $stats->total_pending ?? 0;
            $dues_cleared = $stats->dues_cleared;

            // Logic derived from original:
            // partial_payments = count where balance > 0
            // Since total = cleared + partial (assuming all are one or the other),
            // partial = total - cleared.
            $partial_payments = $total_orders - $dues_cleared;
            $full_payments = $dues_cleared;

            $additional_data = [
                'total_collection' => $total_collection,
                'total_pending' => $total_pending,
                'total_orders' => $total_orders,
                'dues_cleared' => $dues_cleared,
                'partial_payments' => $partial_payments,
                'full_payments' => $full_payments
            ];
        }

        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');

        if ($sortBy === 'delivery_date') {
            $query->orderBy('delivery_date', $sortOrder)
                ->orderBy('created_at', 'desc');
        } else {
            // Sort by created_at - Latest (desc) shows newest first, Oldest (asc) shows oldest first
            $query->orderBy('created_at', $sortOrder);
        }

        $orders = $query->paginate(50);

        if (!empty($additional_data)) {
            $custom = collect($additional_data);
            $data = $custom->merge($orders);
            return response()->json($data);
        }

        return response()->json($orders);
    }

    public function store(Request $request)
    {
        Log::info('Order Store Request: ' . json_encode($request->except('images')));
        Log::info('Has File "images": ' . ($request->hasFile('images') ? 'YES' : 'NO'));

        if ($request->hasFile('images')) {
            $files = $request->file('images');
            Log::info('File Count: ' . count($files));
            foreach ($files as $index => $file) {
                Log::info("File [$index]: Name=" . $file->getClientOriginalName() . ", Size=" . $file->getSize() . ", Mime=" . $file->getClientMimeType());
            }
        } else {
            Log::warning('No images received in request.');
            // Check if it was a post_max_size issue (empty request)
            if (empty($request->all()) && empty($_FILES)) {
                Log::error('Possible POST_MAX_SIZE exceeded. Request empty.');
            }
        }

        $request->validate([
            'token' => 'required|string',
            'customer_name' => 'nullable|string',
            'delivery_date' => 'nullable|date',
            'entry_date' => 'nullable|date',
            'measurements' => 'nullable|array',
            'remarks' => 'nullable|string',
            'total_amount' => 'nullable|numeric|min:0',
            'images.*' => 'nullable|image|max:10240' // 10MB limit per image
        ]);

        try {
            return DB::transaction(function () use ($request) {
                // 1. Create Order
                $order = Order::create([
                    'token' => $request->token,
                    'bill_number' => 'BILL-' . time(),
                    'customer_name' => $request->customer_name,
                    'delivery_date' => $request->delivery_date,
                    'entry_date' => $request->entry_date ?? now()->format('Y-m-d'),
                    'measurements' => $request->measurements ?? [],
                    'remarks' => $request->remarks,
                    'status' => 'pending',
                    'created_by' => Auth::id() ?? 1,
                    'total_amount' => $request->total_amount ?? 0
                ]);

                // 2. Handle Images
                if ($request->hasFile('images')) {
                    foreach ($request->file('images') as $file) {
                        // Store file first
                        $path = $file->store("uploads/orders/{$order->id}", 'public');

                        if (!$path) {
                            throw new \Exception("Failed to store file: " . $file->getClientOriginalName());
                        }

                        // Create DB record
                        $order->images()->create([
                            'filename' => $path,
                            'mime' => $file->getClientMimeType(),
                            'size' => $file->getSize(),
                        ]);
                    }
                }

                return response()->json($order->load('images'), 201);
            });
        } catch (\Exception $e) {
            Log::error('Order creation failed: ' . $e->getMessage());
            // If it was a transaction, everything is rolled back, including the Order.
            return response()->json(['message' => 'Failed to create order: ' . $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $order = Order::with(['images', 'logs.user', 'payments'])->findOrFail($id);
        return response()->json($order);
    }

    public function update(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $request->validate([
            'customer_name' => 'nullable|string',
            'delivery_date' => 'nullable|date',
            'entry_date' => 'nullable|date',
            'measurements' => 'nullable|array',
            'remarks' => 'nullable|string',
            'total_amount' => 'nullable|numeric|min:0'
        ]);

        $order->update($request->all());

        return response()->json($order);
    }

    public function updateStatus(Request $request, $id)
    {
        Log::info('updateStatus called', $request->all());

        $request->validate([
            'status' => 'required|in:pending,ready,delivered,transferred',
            'note' => 'nullable|string',
            'payment_amount' => 'nullable|numeric|min:0',
            'actual_delivery_date' => 'nullable|date'
        ]);

        $order = Order::findOrFail($id);
        $oldStatus = $order->status;
        $order->status = $request->status;

        // Set actual delivery date when marking as delivered
        if ($request->status === 'delivered' && $request->actual_delivery_date) {
            $order->actual_delivery_date = $request->actual_delivery_date;
        }

        $order->save();

        // Handle Payment
        $paymentNote = '';
        if ($request->payment_amount > 0) {
            $paymentDate = $request->actual_delivery_date ?? now();
            $order->payments()->create([
                'amount' => $request->payment_amount,
                'payment_date' => $paymentDate,
                'payment_method' => $request->payment_method ?? 'cash',
                'note' => 'Delivery Payment'
            ]);
            $order->refresh(); // Update balance
        }

        // Strict Remark Logic
        if ($request->status === 'delivered') {
            if ($order->balance == 0) {
                $paymentNote = "Paid in full";
            } else {
                $paymentNote = "{$order->balance} pending";
            }
        }

        // Create Log
        $logNote = $request->note;
        if ($paymentNote) {
            $logNote = $logNote ? "$logNote. $paymentNote" : $paymentNote;
        }

        $order->logs()->create([
            'action' => "status_changed:{$request->status}",
            'note' => $logNote,
            'user_id' => Auth::id() ?? 2 // Use Auth ID
        ]);

        return response()->json($order->load('payments'));
    }

    public function addPayment(Request $request, $id)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'note' => 'nullable|string',
            'payment_date' => 'nullable|date',
            'payment_method' => 'nullable|in:cash,upi,online'
        ]);

        $order = Order::findOrFail($id);

        $order->payments()->create([
            'amount' => $request->amount,
            'payment_date' => $request->payment_date ?? now(),
            'payment_method' => $request->payment_method ?? 'cash',
            'note' => $request->note
        ]);

        // Refresh to get updated balance
        $order->refresh();

        return response()->json($order->load('payments'));
    }

    public function dailyCollections(Request $request)
    {
        $query = Order::with(['payments'])
            ->whereNotNull('actual_delivery_date')
            ->where('status', 'delivered');

        // Filter by date range if provided
        if ($request->has('date_from')) {
            $query->whereDate('actual_delivery_date', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->whereDate('actual_delivery_date', '<=', $request->date_to);
        } elseif (!$request->has('date_from')) {
            // AUTO-FIX: Default to current month to prevent loading full history and crashing memory
            $query->whereDate('actual_delivery_date', '>=', now()->startOfMonth());
        }

        $orders = $query->orderBy('actual_delivery_date', 'desc')->get();

        // Calculate payment method totals
        $paymentMethodTotals = [
            'cash' => 0,
            'upi' => 0,
            'online' => 0
        ];
        foreach ($orders as $order) {
            foreach ($order->payments as $payment) {
                $method = $payment->payment_method ?? 'cash';
                $paymentMethodTotals[$method] = ($paymentMethodTotals[$method] ?? 0) + $payment->amount;
            }
        }

        // Group by actual delivery date
        $collections = $orders->groupBy(function ($order) {
            return $order->actual_delivery_date->format('Y-m-d');
        })->map(function ($dayOrders, $date) {

            // OPTIMIZATION: Calculate sum from the loaded collection, not the accessor
            // The accessor $order->paid_amount uses $order->payments()->sum() which triggers a new DB query per order.
            // Using $order->payments->sum() uses the already eager-loaded relation in memory.
            $dayTotal = $dayOrders->sum(fn($o) => $o->payments->sum('amount'));

            // Calculate day totals by payment method
            $dayMethodTotals = ['cash' => 0, 'upi' => 0, 'online' => 0];
            foreach ($dayOrders as $order) {
                foreach ($order->payments as $payment) {
                    $method = $payment->payment_method ?? 'cash';
                    $dayMethodTotals[$method] += $payment->amount;
                }
            }

            return [
                'date' => $date,
                'total_collected' => $dayTotal,
                'cash_total' => $dayMethodTotals['cash'],
                'upi_total' => $dayMethodTotals['upi'],
                'online_total' => $dayMethodTotals['online'],
                'orders_count' => $dayOrders->count(),
                'orders' => $dayOrders->map(function ($order) {
                    // Start Optimizing individual order serialization
                    $paid = $order->payments->sum('amount');
                    return [
                        'id' => $order->id,
                        'token' => $order->token,
                        'customer_name' => $order->customer_name,
                        'total_amount' => $order->total_amount,
                        'paid_amount' => $paid,
                        'balance' => max(0, $order->total_amount - $paid), // Recalculate locally to avoid accessor query
                        'payments' => $order->payments->map(fn($p) => [
                            'amount' => $p->amount,
                            'method' => $p->payment_method ?? 'cash'
                        ])
                    ];
                })
            ];
        })->values();

        return response()->json([
            'collections' => $collections,
            'totals' => $paymentMethodTotals
        ]);
    }

    public function destroy($id)
    {
        $order = Order::findOrFail($id);
        $order->delete();
        return response()->json(['message' => 'Order deleted']);
    }
}
