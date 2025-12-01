import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';

export const createClient = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const client = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'CLIENT',
            },
        });

        // Exclude password from response
        const { password: _, ...clientData } = client;

        res.status(201).json(clientData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create client' });
    }
};

export const getClients = async (req: Request, res: Response) => {
    try {
        const clients = await prisma.user.findMany({
            where: { role: 'CLIENT' },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                _count: {
                    select: { clientSurveys: true }
                }
            }
        });
        res.json(clients);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch clients' });
    }
};

export const updateClient = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, email, password } = req.body;

        const data: any = { name, email };
        if (password) {
            data.password = await bcrypt.hash(password, 10);
            data.mustChangePassword = true;
        }

        const client = await prisma.user.update({
            where: { id: Number(id) },
            data,
        });

        const { password: _, ...clientData } = client;
        res.json(clientData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update client' });
    }
};

export const deleteClient = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.user.delete({ where: { id: Number(id) } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete client' });
    }
};
