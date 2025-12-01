
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSurveys() {
    try {
        const surveys = await prisma.survey.findMany({
            include: {
                client: true
            }
        });
        console.log('Surveys in DB:', JSON.stringify(surveys, null, 2));

        const clients = await prisma.user.findMany({
            where: { role: 'CLIENT' }
        });
        console.log('Clients in DB:', JSON.stringify(clients, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkSurveys();
