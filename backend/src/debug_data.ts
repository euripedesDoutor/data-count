
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const survey = await prisma.survey.findFirst({
            include: {
                questions: true,
                responses: true
            }
        });

        if (!survey) {
            console.log('No surveys found.');
            return;
        }

        console.log('Survey ID:', survey.id);
        console.log('Survey Title:', survey.title);

        if (survey.questions.length > 0) {
            const q: any = survey.questions[0];
            console.log('First Question ID:', q.id);
            console.log('First Question Type:', q.type);
            console.log('First Question Options Type:', typeof q.options);
            console.log('First Question Options Value:', JSON.stringify(q.options));
            console.log('Is Array?', Array.isArray(q.options));
        }

        console.log('Total Responses:', survey.responses.length);

        if (survey.responses.length > 0) {
            const r: any = survey.responses[0];
            console.log('First Response Data Type:', typeof r.data);
            console.log('First Response Data Value:', JSON.stringify(r.data));
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
