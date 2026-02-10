const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = process.env.SEED_ADMIN_EMAIL || 'admin@admin.com';
    const password = process.env.SEED_ADMIN_PASSWORD || 'admin';

    const hashed = await bcrypt.hash(password, 10);

    await prisma.user.upsert({
        where: { email: 'admin@kapdafactory.com' },
        update: {
            password: hashed,
        },
        create: {
            name: 'Admin',
            email,
            password: hashed,
            role: 'admin',
        },
    });

    console.log(`Seeded admin user: ${email}`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
