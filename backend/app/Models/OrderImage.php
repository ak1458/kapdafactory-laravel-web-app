<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'filename',
        'mime',
        'size',
    ];

    protected $appends = ['url'];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function getUrlAttribute()
    {
        return '/storage/' . $this->filename;
    }
}
