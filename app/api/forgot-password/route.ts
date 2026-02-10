import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/server/prisma';

export async function POST(request: NextRequest) {
    const body = await request.json().catch(() => null);
    const email = body?.email?.trim?.();

    if (!email) {
        return NextResponse.json({ message: 'Email is required.' }, { status: 422 });
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
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

        return NextResponse.json({
            success: true,
            message: 'Email could not be sent. Use the link below to reset your password.',
            email_sent: false,
            reset_link: resetLink,
        });
    } catch {
        return NextResponse.json(
            { message: 'Database unavailable. Verify DATABASE_URL and PostgreSQL TLS settings.' },
            { status: 503 }
        );
    }
}
