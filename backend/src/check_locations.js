const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const responses = await prisma.response.findMany({
        select: {
            id: true,
            location: true,
            surveyId: true
        }
    });

    console.log(`Total responses: ${responses.length}`);
    let withLocation = 0;
    let extracted = 0;
    responses.forEach(r => {
        if (r.location) {
            withLocation++;
            console.log(`Response ${r.id} (Survey ${r.surveyId}):`, JSON.stringify(r.location));

            let loc = null;
            const locData = r.location;
            if (locData.lat && locData.lng) {
                loc = locData;
            } else {
                const keys = Object.keys(locData);
                for (const key of keys) {
                    if (locData[key] && locData[key].lat && locData[key].lng) {
                        loc = locData[key];
                        break;
                    }
                }
            }

            if (loc) {
                console.log(`  -> Extracted: Lat ${loc.lat}, Lng ${loc.lng}`);
                extracted++;
            } else {
                console.log(`  -> Failed to extract location`);
            }
        }
    });
    console.log(`Responses with location: ${withLocation}`);
    console.log(`Successfully extracted: ${extracted}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
