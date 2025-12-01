import type { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getUsers = async (req: Request, res: Response) => {
    try {
        const { role } = req.query;

        const where: any = {};
        if (role) {
            where.role = role;
        }

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            }
        });

        console.log(`Fetched ${users.length} users with role ${role}`);
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Error fetching users' });
    }
};
