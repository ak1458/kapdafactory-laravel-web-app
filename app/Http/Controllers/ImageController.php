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
        // FIXED: Added explicit MIME type validation
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,gif,webp,jpg|max:3072', // 3MB max
        ]);

        $order = Order::findOrFail($orderId);
        $file = $request->file('image');

        // Additional server-side MIME validation
        $allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!in_array($file->getMimeType(), $allowedMimes)) {
            return response()->json(['message' => 'Invalid file type'], 422);
        }

        // Store in storage/app/public/uploads/orders/{id} using public disk
        $path = $file->store("uploads/orders/{$order->id}", 'public');

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

        if (Storage::disk('public')->exists($image->filename)) {
            Storage::disk('public')->delete($image->filename);
        }

        $image->delete();
        return response()->json(['message' => 'Image deleted']);
    }
}
