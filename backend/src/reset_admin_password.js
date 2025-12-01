const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!admin) {
        console.log('No admin found');
        return;
    }
    console.log('Found admin:', admin.email);
    const password = await bcrypt.hash('admin123', 10);
    await prisma.user.update({
        where: { id: admin.id },
        data: { password }
    });
    console.log('Password reset for', admin.email);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
