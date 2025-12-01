
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Connecting to database...');
        const userCount = await prisma.user.count();
        console.log(`Connection successful. User count: ${userCount}`);

        const admin = await prisma.user.findUnique({
            where: { email: 'admin@datacount.com' }
        });
        console.log('Admin user found:', !!admin);

    } catch (e) {
        console.error('Connection failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
