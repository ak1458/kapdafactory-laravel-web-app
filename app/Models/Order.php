<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'token',
        'bill_number',
        'customer_name',
        'measurements',
        'delivery_date',
        'entry_date',
        'actual_delivery_date',
        'status',
        'remarks',
        'created_by',
        'total_amount',
    ];

    protected $casts = [
        'measurements' => 'array',
        'delivery_date' => 'date',
        'entry_date' => 'date',
        'actual_delivery_date' => 'date',
    ];

    protected $appends = ['paid_amount', 'balance'];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function images()
    {
        return $this->hasMany(OrderImage::class);
    }

    public function logs()
    {
        return $this->hasMany(OrderLog::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    // FIXED: Use loaded relation instead of triggering new query
    // When payments are eager-loaded, this uses in-memory collection
    // When not loaded, it will load the relation once
    public function getPaidAmountAttribute()
    {
        // Use the already-loaded relation if available, otherwise load it once
        return $this->relationLoaded('payments')
            ? $this->payments->sum('amount')
            : $this->payments()->sum('amount');
    }

    public function getBalanceAttribute()
    {
        return max(0, $this->total_amount - $this->paid_amount);
    }

    public function scopeFilter($query, array $filters)
    {
        if ($search = $filters['search'] ?? false) {
            $query->where(function ($q) use ($search) {
                $q->where('token', 'like', "%{$search}%")
                    ->orWhere('bill_number', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%")
                    ->orWhereDate('delivery_date', $search);
            });
        }

        if (($status = $filters['status'] ?? false) && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($dateFrom = $filters['date_from'] ?? false) {
            $query->whereDate('delivery_date', '>=', $dateFrom);
        }

        if ($dateTo = $filters['date_to'] ?? false) {
            $query->whereDate('delivery_date', '<=', $dateTo);
        }

        // Exact date match (used for Dashboard stats context)
        if ($date = $filters['date'] ?? false) {
            $query->whereDate('delivery_date', $date);
        }
    }
}
