<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with('images');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('token', 'like', "%{$search}%")
                    ->orWhere('bill_number', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%")
                    ->orWhereDate('delivery_date', $search);
            });
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('date_from')) {
            $query->whereDate('delivery_date', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('delivery_date', '<=', $request->date_to);
        }

        // Apply date filter if provided (for Dashboard Daily Summary)
        $additional_data = [];
        if ($request->has('date')) {
            $query->whereDate('delivery_date', $request->date);

            // Calculate daily stats
            $statsQuery = clone $query;
            $ordersForStats = $statsQuery->get();

            // Total Collection = sum of total_amount for DELIVERED orders only
            $deliveredOrders = $ordersForStats->where('status', 'delivered');
            $total_collection = $deliveredOrders->sum('total_amount');

            // Pending = sum of total_amount for NON-DELIVERED orders
            $nonDeliveredOrders = $ordersForStats->whereNotIn('status', ['delivered', 'transferred']);
            $total_pending = $nonDeliveredOrders->sum('total_amount');

            $total_orders = $ordersForStats->count();
            $dues_cleared = $ordersForStats->where('balance', 0)->count();
            $partial_payments = $ordersForStats->where('balance', '>', 0)->count();
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
            $query->orderBy('created_at', 'desc');
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
        Log::info('Order Store Request: ' . json_encode($request->all()));

        $request->validate([
            'token' => 'required|string',
            'customer_name' => 'nullable|string',
            'delivery_date' => 'nullable|date',
            'measurements' => 'nullable|array',
            'remarks' => 'nullable|string',
            'total_amount' => 'nullable|numeric|min:0',
            'images.*' => 'nullable|image|max:10240' // 10MB Max
        ]);

        // Generate a unique token (e.g., #1001) if not provided or just use input
        // The user input 'token' is actually the Bill Number / Token manually entered.
        // But we also generate a unique bill_number internally.

        $order = Order::create([
            'token' => $request->token,
            'bill_number' => 'BILL-' . time(),
            'customer_name' => $request->customer_name,
            'delivery_date' => $request->delivery_date,
            'measurements' => $request->measurements ?? [],
            'remarks' => $request->remarks,
            'status' => 'pending', // Default status
            'created_by' => 1, // Hardcoded for now, replace with Auth::id() later
            'total_amount' => $request->total_amount ?? 0
        ]);

        // Handle Image Uploads
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store("uploads/orders/{$order->id}");
                $order->images()->create([
                    'filename' => $path,
                    'mime' => $file->getClientMimeType(),
                    'size' => $file->getSize(),
                ]);
            }
        }

        return response()->json($order->load('images'), 201);
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
            'payment_amount' => 'nullable|numeric|min:0'
        ]);

        $order = Order::findOrFail($id);
        $oldStatus = $order->status;
        $order->status = $request->status;
        $order->save();

        // Handle Payment
        $paymentNote = '';
        if ($request->payment_amount > 0) {
            $order->payments()->create([
                'amount' => $request->payment_amount,
                'payment_date' => now(),
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
            'user_id' => 1 // Hardcoded for now
        ]);

        return response()->json($order->load('payments'));
    }

    public function addPayment(Request $request, $id)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'note' => 'nullable|string',
            'payment_date' => 'nullable|date'
        ]);

        $order = Order::findOrFail($id);

        $order->payments()->create([
            'amount' => $request->amount,
            'payment_date' => $request->payment_date ?? now(),
            'note' => $request->note
        ]);

        // Refresh to get updated balance
        $order->refresh();

        return response()->json($order->load('payments'));
    }

    public function destroy($id)
    {
        $order = Order::findOrFail($id);
        $order->delete();
        return response()->json(['message' => 'Order deleted']);
    }
}
