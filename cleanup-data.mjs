import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function cleanup() {
    console.log('Starting cleanup...');

    // 1. Delete all database records (respecting foreign keys)
    // Delete in order: OrderImage, Payment, OrderLog -> Order
    await prisma.orderImage.deleteMany({});
    console.log('Deleted OrderImages');

    await prisma.payment.deleteMany({});
    console.log('Deleted Payments');

    await prisma.orderLog.deleteMany({});
    console.log('Deleted OrderLogs');

    await prisma.order.deleteMany({});
    console.log('Deleted Orders');

    // 2. Clear storage directory
    const storageDir = path.join(process.cwd(), 'public', 'storage');
    if (fs.existsSync(storageDir)) {
        fs.rmSync(storageDir, { recursive: true, force: true });
        console.log('Deleted public/storage directory');
    }

    // Recreate empty storage directory structure
    const uploadsDir = path.join(storageDir, 'uploads', 'orders');
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Recreated empty storage structure');

    console.log('Cleanup complete!');
}

cleanup()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
