
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
    const email = 'admin@admin.com';
    const password = 'admin';

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        // Upsert ensures we create the user if it doesn't exist, or update it if it does
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                name: 'Admin'
            },
            create: {
                email,
                password: hashedPassword,
                name: 'Admin',
                role: 'admin'
            },
        });

        return NextResponse.json({
            success: true,
            message: `Admin user ${user.email} reset successfully. Password is 'admin'.`
        });

    } catch (e) {
        return NextResponse.json({
            success: false,
            error: String(e)
        }, { status: 500 });
    }
}
