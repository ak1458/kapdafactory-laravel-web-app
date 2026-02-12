import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { createAccessToken } from '@/src/server/auth';
import { prisma } from '@/src/server/prisma';
import { serializeUser } from '@/src/server/serializers';

export async function POST(request: NextRequest) {
    const body = await request.json().catch(() => null);
    const email = body?.email?.trim?.();
    const password = body?.password;

    if (!email || !password) {
        return NextResponse.json({ message: 'Invalid login details' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return NextResponse.json({ message: 'Invalid login details' }, { status: 401 });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return NextResponse.json({ message: 'Invalid login details' }, { status: 401 });
        }

        const safeUser = serializeUser(user);
        const token = await createAccessToken({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        });

        const response = NextResponse.json({
            access_token: token,
            token_type: 'Bearer',
            user: safeUser,
        });

        response.cookies.set('kf_token', token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 30,
            path: '/',
        });

        return response;
    } catch {
        return NextResponse.json(
            { message: 'Database unavailable. Verify DATABASE_URL and PostgreSQL TLS settings.' },
            { status: 503 }
        );
    }
}
