
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@admin.com';
    const password = 'admin';

    console.log(`Resetting password for ${email}...`);

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        // Upsert ensures we create the user if it doesn't exist, or update it if it does
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                name: 'Admin' // Ensure name is set
            },
            create: {
                email,
                password: hashedPassword,
                name: 'Admin',
                role: 'admin'
            },
        });

        console.log(`Success! User ${user.email} updated.`);
        console.log(`Email: ${user.email}`);
        console.log(`Password: ${password}`);

    } catch (e) {
        console.error('Error resetting password:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
