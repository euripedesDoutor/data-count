const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const clients = await prisma.user.findMany({
        where: { role: 'CLIENT' }
    });
    console.log(`Found ${clients.length} clients.`);
    clients.forEach(c => console.log(`- ${c.name} (${c.email})`));

    const allUsers = await prisma.user.findMany();
    console.log(`Total users: ${allUsers.length}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
