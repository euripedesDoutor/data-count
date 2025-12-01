import type { Request, Response } from 'express';
import prisma from '../utils/prisma';

interface AuthRequest extends Request {
    user?: any;
}

export const submitResponse = async (req: AuthRequest, res: Response) => {
    try {
        const { surveyId, data, location } = req.body;
        const interviewerId = req.user.id;

        const response = await prisma.response.create({
            data: {
                surveyId,
                interviewerId,
                data,
                location,
            },
        });

        res.status(201).json(response);
    } catch (error) {
        res.status(500).json({ error: 'Error submitting response' });
    }
};

export const getResponses = async (req: Request, res: Response) => {
    try {
        const { surveyId } = req.query;
        const where = surveyId ? { surveyId: Number(surveyId) } : {};

        const responses = await prisma.response.findMany({
            where,
            include: { interviewer: { select: { name: true } } },
        });

        res.json(responses);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching responses' });
    }
};
