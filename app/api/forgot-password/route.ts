import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/server/prisma';
import { sendEmail } from '@/src/lib/email';

export async function POST(request: NextRequest) {
    const body = await request.json().catch(() => null);
    const email = body?.email?.trim?.();

    if (!email) {
        return NextResponse.json({ message: 'Email is required.' }, { status: 422 });
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Check if we should return 404 or generic success to prevent enumeration
            // For now, returning 404 as requested by user ("No account found")
            return NextResponse.json(
                {
                    success: false,
                    message: 'No account found with this email address.',
                },
                { status: 404 }
            );
        }

        const token = randomBytes(30).toString('hex');

        await prisma.passwordReset.upsert({
            where: { email },
            create: {
                email,
                token,
                createdAt: new Date(),
            },
            update: {
                token,
                createdAt: new Date(),
            },
        });

        const appUrl = process.env.APP_URL || request.nextUrl.origin;
        const resetLink = `${appUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Reset Your Password</h2>
                <p>You requested a password reset. Click the link below to reset your password:</p>
                <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #075E54; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
                <p>If you didn't ask for this, you can ignore this email.</p>
                <p>Link expires in 60 minutes.</p>
            </div>
        `;

        await sendEmail(email, 'Password Reset Request', html);

        return NextResponse.json({
            success: true,
            message: 'If an account exists for this email, a reset link has been sent.',
            email_sent: true,
        });
    } catch {
        return NextResponse.json(
            { message: 'Service unavailable. Please try again later.' },
            { status: 503 }
        );
    }
}
