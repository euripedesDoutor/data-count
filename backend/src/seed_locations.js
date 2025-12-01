const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CENTER_LAT = -16.9107833;
const CENTER_LNG = -49.3282453;
const RADIUS_KM = 1;

// Approximate degrees for 1km
// 1 deg lat ~= 111km => 1km ~= 0.009 deg
// 1 deg lng ~= 111km * cos(lat) => at -16 deg, 1km ~= 0.0094 deg
const DEG_PER_KM_LAT = 0.009;
const DEG_PER_KM_LNG = 0.0094;

function getRandomLocation() {
    // Random offset between -1 and 1 * deg_per_km
    const latOffset = (Math.random() * 2 - 1) * DEG_PER_KM_LAT;
    const lngOffset = (Math.random() * 2 - 1) * DEG_PER_KM_LNG;

    return {
        lat: CENTER_LAT + latOffset,
        lng: CENTER_LNG + lngOffset
    };
}

async function main() {
    console.log('Fetching responses...');
    const responses = await prisma.response.findMany();
    console.log(`Found ${responses.length} responses.`);

    let updatedCount = 0;

    for (const response of responses) {
        const newLocation = getRandomLocation();

        // We'll store it in the simple format { lat, lng }
        // The backend controller I fixed supports this direct format.

        await prisma.response.update({
            where: { id: response.id },
            data: {
                location: newLocation
            }
        });
        updatedCount++;
    }

    console.log(`Updated ${updatedCount} responses with new locations.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
