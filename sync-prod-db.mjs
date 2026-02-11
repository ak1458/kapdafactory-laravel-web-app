import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

async function main() {
    console.log('🔄 Preparing to migrate and seed PRODUCTION database...');

    // 1. Read production URL
    const envPath = path.join(process.cwd(), '.env.production.local');
    if (!fs.existsSync(envPath)) {
        throw new Error('.env.production.local not found! Run "vercel env pull .env.production.local" first.');
    }

    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/POSTGRES_URL_NON_POOLING="(.*?)"/);

    if (!match || !match[1]) {
        throw new Error('POSTGRES_URL_NON_POOLING not found in .env.production.local');
    }

    const databaseUrl = match[1];
    console.log('✅ Found production database URL.');

    // 2. Run Database Push (Schema Sync)
    console.log('🚀 Running "prisma db push"...');
    try {
        execSync('npx prisma db push', {
            stdio: 'inherit',
            env: { ...process.env, DATABASE_URL: databaseUrl },
        });
        console.log('✅ Schema pushed successfully.');
    } catch (error) {
        console.error('❌ Schema push failed:', error.message);
        process.exit(1);
    }

    // 3. Seed Admin User
    console.log('🌱 Seeding admin user...');
    const prisma = new PrismaClient({
        datasources: {
            db: { url: databaseUrl },
        },
    });

    try {
        const adminEmail = 'admin@example.com';
        const existingUser = await prisma.user.findUnique({
            where: { email: adminEmail },
        });

        if (existingUser) {
            console.log('ℹ️  Admin user already exists.');
        } else {
            await prisma.user.create({
                data: {
                    name: 'Admin',
                    email: adminEmail,
                    password: '$2a$10$Oy6Ol2Q8omBKQsUuCI1e.OSvWVsI4ouIBWTTIPA6LYcesWtt6M1rq', // 'password'
                    role: 'admin',
                    updatedAt: new Date(),
                },
            });
            console.log('✅ Admin user created successfully!');
            console.log('   Email: admin@example.com');
            console.log('   Password: password');
        }
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch(console.error);
