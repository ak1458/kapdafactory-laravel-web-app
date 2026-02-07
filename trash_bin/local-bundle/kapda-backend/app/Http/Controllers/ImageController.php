<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ImageController extends Controller
{
    public function store(Request $request, $orderId)
    {
        $request->validate([
            'image' => 'required|image|max:3072', // 3MB max
        ]);

        $order = Order::findOrFail($orderId);
        $file = $request->file('image');
        
        // Store in storage/app/uploads/orders/{id}
        $path = $file->store("uploads/orders/{$order->id}");
        
        $image = $order->images()->create([
            'filename' => $path,
            'mime' => $file->getClientMimeType(),
            'size' => $file->getSize(),
        ]);

        return response()->json($image, 201);
    }

    public function destroy($orderId, $imageId)
    {
        $image = OrderImage::where('order_id', $orderId)->findOrFail($imageId);
        
        if (Storage::exists($image->filename)) {
            Storage::delete($image->filename);
        }
        
        $image->delete();
        return response()->json(['message' => 'Image deleted']);
    }
}
