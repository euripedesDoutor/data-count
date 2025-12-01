
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';

interface AuthRequest extends Request {
    user?: any;
}

export const createCollector = async (req: AuthRequest, res: Response) => {
    try {
        const { name, email, password, clientId } = req.body;
        const userRole = req.user.role;
        const userId = req.user.id;

        let managerId: number | null = null;

        if (userRole === 'CLIENT') {
            managerId = userId;
        } else if (userRole === 'ADMIN') {
            if (!clientId) {
                return res.status(400).json({ error: 'Client ID is required for Admin' });
            }
            managerId = Number(clientId);
        } else {
            return res.status(403).json({ error: 'Access denied' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const collector = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'INTERVIEWER',
                managerId: managerId,
            },
        });

        const { password: _, ...collectorData } = collector;
        res.status(201).json(collectorData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create collector' });
    }
};

export const getCollectors = async (req: AuthRequest, res: Response) => {
    try {
        const userRole = req.user.role;
        const userId = req.user.id;
        const { clientId } = req.query;

        let where: any = { role: 'INTERVIEWER' };

        if (userRole === 'CLIENT') {
            where.managerId = userId;
        } else if (userRole === 'ADMIN') {
            if (clientId) {
                where.managerId = Number(clientId);
            }
        } else {
            return res.status(403).json({ error: 'Access denied' });
        }

        const collectors = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                manager: { select: { name: true } }
            }
        });

        res.json(collectors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch collectors' });
    }
};

export const updateCollector = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { name, email, password } = req.body;
        const userRole = req.user.role;
        const userId = req.user.id;

        const collector = await prisma.user.findUnique({ where: { id: Number(id) } });

        if (!collector) {
            return res.status(404).json({ error: 'Collector not found' });
        }

        if (userRole === 'CLIENT' && collector.managerId !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const data: any = { name, email };
        if (password) {
            data.password = await bcrypt.hash(password, 10);
            data.mustChangePassword = true;
        }

        const updatedCollector = await prisma.user.update({
            where: { id: Number(id) },
            data,
        });

        const { password: _, ...collectorData } = updatedCollector;
        res.json(collectorData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update collector' });
    }
};

export const deleteCollector = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userRole = req.user.role;
        const userId = req.user.id;

        const collector = await prisma.user.findUnique({ where: { id: Number(id) } });

        if (!collector) {
            return res.status(404).json({ error: 'Collector not found' });
        }

        if (userRole === 'CLIENT' && collector.managerId !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        await prisma.user.delete({ where: { id: Number(id) } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete collector' });
    }
};
