const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    const email = 'admin@datacount.com';
    const password = await bcrypt.hash('admin123', 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password,
            role: 'ADMIN'
        },
        create: {
            email,
            name: 'Admin',
            password,
            role: 'ADMIN'
        }
    });

    console.log('Admin user created/updated:', user.email);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
