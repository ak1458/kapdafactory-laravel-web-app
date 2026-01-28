<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class ExportController extends Controller
{
    /**
     * Export orders to CSV
     */
    public function exportOrders(Request $request)
    {
        $query = Order::with(['payments', 'images']);

        // Apply filters
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $orders = $query->orderBy('created_at', 'desc')->get();

        // CSV Headers
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="orders_export_' . date('Y-m-d') . '.csv"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($orders) {
            $file = fopen('php://output', 'w');

            // Header row
            fputcsv($file, [
                'Order ID',
                'Token',
                'Entry Date',
                'Customer Name',
                'Delivery Date',
                'Status',
                'Total Amount',
                'Paid Amount',
                'Balance',
                'Payment Methods',
                'Remarks',
                'Created At'
            ]);

            // Data rows
            foreach ($orders as $order) {
                $paidAmount = $order->payments->sum('amount');
                $balance = max(0, $order->total_amount - $paidAmount);

                // Get payment methods summary
                $paymentMethods = $order->payments->groupBy('payment_method')
                    ->map(fn($payments, $method) => ucfirst($method ?? 'cash') . ': ₹' . $payments->sum('amount'))
                    ->implode(', ');

                fputcsv($file, [
                    $order->id,
                    $order->token,
                    $order->entry_date ? date('d-m-Y', strtotime($order->entry_date)) : date('d-m-Y', strtotime($order->created_at)),
                    $order->customer_name ?? 'N/A',
                    $order->delivery_date ? date('d-m-Y', strtotime($order->delivery_date)) : 'N/A',
                    ucfirst($order->status),
                    $order->total_amount,
                    $paidAmount,
                    $balance,
                    $paymentMethods ?: 'No payments',
                    $order->remarks ?? '',
                    date('d-m-Y H:i', strtotime($order->created_at))
                ]);
            }

            fclose($file);
        };

        return Response::stream($callback, 200, $headers);
    }

    /**
     * Export daily collections to CSV
     */
    public function exportCollections(Request $request)
    {
        $query = Order::with(['payments'])
            ->whereNotNull('actual_delivery_date')
            ->where('status', 'delivered');

        // Apply date filters
        if ($request->has('date_from')) {
            $query->whereDate('actual_delivery_date', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->whereDate('actual_delivery_date', '<=', $request->date_to);
        } elseif (!$request->has('date_from')) {
            $query->whereDate('actual_delivery_date', '>=', now()->startOfMonth());
        }

        $orders = $query->orderBy('actual_delivery_date', 'desc')->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="collections_export_' . date('Y-m-d') . '.csv"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($orders) {
            $file = fopen('php://output', 'w');

            // Header row
            fputcsv($file, [
                'Delivery Date',
                'Token',
                'Customer Name',
                'Total Amount',
                'Cash',
                'UPI',
                'Online',
                'Total Paid',
                'Balance'
            ]);

            // Data rows
            foreach ($orders as $order) {
                $cashTotal = $order->payments->where('payment_method', 'cash')->sum('amount');
                $upiTotal = $order->payments->where('payment_method', 'upi')->sum('amount');
                $onlineTotal = $order->payments->where('payment_method', 'online')->sum('amount');
                $totalPaid = $order->payments->sum('amount');
                $balance = max(0, $order->total_amount - $totalPaid);

                fputcsv($file, [
                    date('d-m-Y', strtotime($order->actual_delivery_date)),
                    $order->token,
                    $order->customer_name ?? 'N/A',
                    $order->total_amount,
                    $cashTotal,
                    $upiTotal,
                    $onlineTotal,
                    $totalPaid,
                    $balance
                ]);
            }

            // Add summary row
            fputcsv($file, []); // Empty row
            fputcsv($file, ['SUMMARY']);

            $totalCash = $orders->sum(fn($o) => $o->payments->where('payment_method', 'cash')->sum('amount'));
            $totalUpi = $orders->sum(fn($o) => $o->payments->where('payment_method', 'upi')->sum('amount'));
            $totalOnline = $orders->sum(fn($o) => $o->payments->where('payment_method', 'online')->sum('amount'));
            $grandTotal = $orders->sum(fn($o) => $o->payments->sum('amount'));
            $totalBalance = $orders->sum(fn($o) => max(0, $o->total_amount - $o->payments->sum('amount')));

            fputcsv($file, [
                'Total',
                $orders->count() . ' orders',
                '',
                $orders->sum('total_amount'),
                $totalCash,
                $totalUpi,
                $totalOnline,
                $grandTotal,
                $totalBalance
            ]);

            fclose($file);
        };

        return Response::stream($callback, 200, $headers);
    }
}
