import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

async function seedProduction() {
    console.log('Starting production seed...');

    // 1. Read the production database URL from localized env file
    const envPath = path.join(process.cwd(), '.env.production.local');
    if (!fs.existsSync(envPath)) {
        throw new Error('.env.production.local not found! Run "vercel env pull .env.production.local" first.');
    }

    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/POSTGRES_PRISMA_URL="(.*?)"/);

    if (!match || !match[1]) {
        throw new Error('POSTGRES_PRISMA_URL not found in .env.production.local');
    }

    const databaseUrl = match[1];
    console.log('Connecting to production database...');

    // 2. Initialize Prisma with the production URL
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: databaseUrl,
            },
        },
    });

    try {
        // 3. Create Admin User
        const adminEmail = 'admin@example.com';
        const existingUser = await prisma.user.findUnique({
            where: { email: adminEmail },
        });

        if (existingUser) {
            console.log('Admin user already exists.');
        } else {
            await prisma.user.create({
                data: {
                    name: 'Admin',
                    email: adminEmail,
                    // Password is 'password'
                    password: '$2a$10$Oy6Ol2Q8omBKQsUuCI1e.OSvWVsI4ouIBWTTIPA6LYcesWtt6M1rq',
                    role: 'admin',
                    updatedAt: new Date(),
                },
            });
            console.log('Admin user created successfully!');
            console.log('Email: admin@example.com');
            console.log('Password: password');
        }
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedProduction().catch(console.error);
