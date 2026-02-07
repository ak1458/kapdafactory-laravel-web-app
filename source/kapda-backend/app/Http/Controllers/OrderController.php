<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with('images');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('token', 'like', "%{$search}%")
                  ->orWhere('bill_number', 'like', "%{$search}%")
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

        return $query->orderBy('delivery_date', 'desc')->latest()->paginate(20);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'token' => 'required|unique:orders',
            'bill_number' => 'nullable|unique:orders',
            'customer_name' => 'nullable|string',
            'measurements' => 'required|array',
            'delivery_date' => 'nullable|date',
            'remarks' => 'nullable|string',
        ]);

        $order = Order::create([
            ...$validated,
            'created_by' => $request->user()->id,
            'status' => 'pending'
        ]);

        return response()->json($order, 201);
    }

    public function show($id)
    {
        return Order::with(['images', 'logs.user'])->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        
        $validated = $request->validate([
            'bill_number' => 'nullable|unique:orders,bill_number,'.$id,
            'customer_name' => 'nullable|string',
            'measurements' => 'nullable|array',
            'delivery_date' => 'nullable|date',
            'remarks' => 'nullable|string',
        ]);

        $order->update($validated);
        return response()->json($order);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,ready,delivered',
            'note' => 'nullable|string'
        ]);

        $order = Order::findOrFail($id);
        $oldStatus = $order->status;

        if ($oldStatus !== $request->status) {
            DB::transaction(function () use ($order, $request, $oldStatus) {
                $order->update(['status' => $request->status]);

                OrderLog::create([
                    'order_id' => $order->id,
                    'user_id' => $request->user()->id,
                    'action' => "status_changed:{$request->status}",
                    'note' => $request->note
                ]);
            });
        }

        return response()->json($order);
    }
}
