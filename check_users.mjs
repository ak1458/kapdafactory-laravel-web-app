import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log('--- Users in Database ---');
    if (users.length === 0) {
        console.log('No users found in the database.');
    } else {
        users.forEach(u => {
            console.log(`ID: ${u.id}, Email: ${u.email}, Name: ${u.name || 'N/A'}`);
        });
    }
    console.log('-------------------------');
  } catch (e) {
    console.error('Error fetching users:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
