import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const p = new PrismaClient();

const images = await p.orderImage.findMany();
console.log('=== ORDER IMAGES IN DB ===');
console.log(JSON.stringify(images, null, 2));
console.log(`Total: ${images.length}`);

const orders = await p.order.findMany({ include: { images: true } });
console.log('\n=== ORDERS ===');
for (const o of orders) {
    console.log(`Order #${o.token} (id=${o.id}): ${o.images.length} images`);
    for (const img of o.images) {
        const filePath = path.join(process.cwd(), 'public', 'storage', img.filename);
        const exists = fs.existsSync(filePath);
        console.log(`  - ${img.filename} (exists on disk: ${exists})`);
    }
}

// Check storage directory
const storageDir = path.join(process.cwd(), 'public', 'storage', 'uploads', 'orders');
if (fs.existsSync(storageDir)) {
    console.log('\n=== FILES ON DISK ===');
    const listDir = (dir, prefix = '') => {
        const items = fs.readdirSync(dir);
        for (const item of items) {
            const full = path.join(dir, item);
            const stat = fs.statSync(full);
            if (stat.isDirectory()) {
                listDir(full, prefix + item + '/');
            } else {
                console.log(`  ${prefix}${item} (${stat.size} bytes)`);
            }
        }
    };
    listDir(storageDir);
} else {
    console.log('\n=== Storage directory does not exist ===');
}

await p.$disconnect();
