<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => $user
            ]);
        }

        return response()->json(['message' => 'Invalid login details'], 401);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            // Return success even if user not found to prevent enumeration
            return response()->json(['message' => 'If an account exists, a reset link has been sent.']);
        }

        // Generate a simple token (in production use Password::broker())
        // For this simple app, we'll just log it as requested
        $token = \Illuminate\Support\Str::random(60);
        
        // Store token in DB (we need a password_resets table or similar, but for now let's just log it for the user to copy-paste)
        // Laravel default migration has password_resets table.
        \Illuminate\Support\Facades\DB::table('password_resets')->updateOrInsert(
            ['email' => $request->email],
            ['token' => $token, 'created_at' => now()]
        );

        \Illuminate\Support\Facades\Log::info("Password Reset Link for {$request->email}: " . url("/reset-password?token={$token}&email={$request->email}"));

        return response()->json(['message' => 'If an account exists, a reset link has been sent.']);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:6',
        ]);

        $record = \Illuminate\Support\Facades\DB::table('password_resets')
            ->where('email', $request->email)
            ->where('token', $request->token)
            ->first();

        if (!$record) {
            return response()->json(['message' => 'Invalid token'], 400);
        }

        $user = User::where('email', $request->email)->first();
        $user->update(['password' => \Illuminate\Support\Facades\Hash::make($request->password)]);

        \Illuminate\Support\Facades\DB::table('password_resets')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Password reset successfully']);
    }
}
