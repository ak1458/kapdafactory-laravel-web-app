<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required',
            'password' => 'required',
        ]);

        Log::info('Login attempt', $credentials);

        if (Auth::attempt($credentials)) {
            Log::info('Login success');
            /** @var \App\Models\User $user */
            $user = Auth::user();
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => $user
            ]);
        }

        Log::error('Login failed for user: ' . $credentials['email']);
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
            // Return error if user not found (for this internal app, it's OK to show)
            return response()->json([
                'success' => false,
                'message' => 'No account found with this email address.'
            ], 404);
        }

        // Generate a secure token
        $token = Str::random(60);

        // Store token in password_resets table
        DB::table('password_resets')->updateOrInsert(
            ['email' => $request->email],
            ['token' => $token, 'created_at' => now()]
        );

        // Generate reset link
        $appUrl = config('app.url', 'http://127.0.0.1:8000');
        $resetLink = "{$appUrl}/reset-password?token={$token}&email=" . urlencode($request->email);

        // Try to send email
        $emailSent = false;
        try {
            Mail::raw(
                "Hello {$user->name},\n\nClick the link below to reset your password:\n\n{$resetLink}\n\nThis link will expire in 60 minutes.\n\nIf you did not request a password reset, please ignore this email.\n\nRegards,\nKapdaFactory Team",
                function ($message) use ($user) {
                    $message->to($user->email)
                        ->subject('Password Reset - KapdaFactory');
                }
            );
            $emailSent = true;
            Log::info("Password reset email sent to: {$user->email}");
        } catch (\Exception $e) {
            Log::warning("Failed to send password reset email: " . $e->getMessage());
            // Email failed, but we'll show the link directly
        }

        // Log the link for debugging
        Log::info("Password Reset Link for {$request->email}: {$resetLink}");

        return response()->json([
            'success' => true,
            'message' => $emailSent
                ? 'A password reset link has been sent to your email.'
                : 'Email could not be sent. Use the link below to reset your password.',
            'email_sent' => $emailSent,
            'reset_link' => $resetLink  // Always include the link for display
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:6',
        ]);

        $record = DB::table('password_resets')
            ->where('email', $request->email)
            ->where('token', $request->token)
            ->first();

        if (!$record) {
            return response()->json(['message' => 'Invalid or expired reset link. Please request a new one.'], 400);
        }

        // Check if token is expired (60 minutes)
        $createdAt = \Carbon\Carbon::parse($record->created_at);
        if ($createdAt->addMinutes(60)->isPast()) {
            DB::table('password_resets')->where('email', $request->email)->delete();
            return response()->json(['message' => 'Reset link has expired. Please request a new one.'], 400);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $user->update(['password' => Hash::make($request->password)]);

        // Delete the used token
        DB::table('password_resets')->where('email', $request->email)->delete();

        Log::info("Password reset successful for: {$request->email}");

        return response()->json([
            'success' => true,
            'message' => 'Password reset successfully! You can now login with your new password.'
        ]);
    }
}
