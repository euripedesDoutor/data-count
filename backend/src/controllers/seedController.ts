import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import bcrypt from 'bcryptjs';



export const seedDatabase = async (req: Request, res: Response) => {
    try {
        const email = 'admin@datacount.com';
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await prisma.user.upsert({
            where: { email },
            update: {},
            create: {
                email,
                name: 'Admin User',
                password: hashedPassword,
                role: 'ADMIN',
            },
        });

        res.json({ message: 'Database seeded successfully', admin });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to seed database' });
    }
};
