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
        'status',
        'remarks',
        'created_by',
        'total_amount',
    ];

    protected $casts = [
        'measurements' => 'array',
        'delivery_date' => 'date',
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

    public function getPaidAmountAttribute()
    {
        return $this->payments()->sum('amount');
    }

    public function getBalanceAttribute()
    {
        return max(0, $this->total_amount - $this->paid_amount);
    }
}
