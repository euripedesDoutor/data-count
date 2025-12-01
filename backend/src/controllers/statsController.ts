import type { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { startOfDay, format, addDays, isBefore, parseISO } from 'date-fns';

interface AuthRequest extends Request {
    user?: any;
}

export const getStats = async (req: AuthRequest, res: Response) => {
    try {
        const userId = Number(req.user.id);
        const userRole = req.user.role;

        let surveyCount = 0;
        let collectorCount = 0;

        let clientCount = 0;
        let questionCount = 0;
        let responseCount = 0;

        if (userRole === 'ADMIN') {
            surveyCount = await prisma.survey.count();
            collectorCount = await prisma.user.count({
                where: { role: 'INTERVIEWER' }
            });
            clientCount = await prisma.user.count({
                where: { role: 'CLIENT' }
            });
            questionCount = await prisma.question.count();
            responseCount = await prisma.response.count();
        } else if (userRole === 'CLIENT') {
            // Count surveys created by client OR assigned to client
            surveyCount = await prisma.survey.count({
                where: {
                    OR: [
                        { createdById: userId },
                        { clientId: userId }
                    ]
                }
            });

            // Count collectors managed by client
            collectorCount = await prisma.user.count({
                where: {
                    role: 'INTERVIEWER',
                    managerId: userId
                }
            });

            // Count questions in surveys visible to client
            questionCount = await prisma.question.count({
                where: {
                    survey: {
                        OR: [
                            { createdById: userId },
                            { clientId: userId }
                        ]
                    }
                }
            });

            // Count responses in surveys visible to client
            responseCount = await prisma.response.count({
                where: {
                    survey: {
                        OR: [
                            { createdById: userId },
                            { clientId: userId }
                        ]
                    }
                }
            });
        } else {
            // For INTERVIEWER, maybe show assigned surveys?
            surveyCount = await prisma.survey.count({
                where: {
                    collectors: { some: { id: userId } }
                }
            });
            collectorCount = 0; // Interviewers don't manage collectors

            // Count questions in assigned surveys
            questionCount = await prisma.question.count({
                where: {
                    survey: {
                        collectors: { some: { id: userId } }
                    }
                }
            });

            // Count responses submitted by this interviewer
            responseCount = await prisma.response.count({
                where: {
                    interviewerId: userId
                }
            });
        }

        res.json({
            surveys: surveyCount,
            collectors: collectorCount,
            clients: clientCount,
            questions: questionCount,
            responses: responseCount
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Error fetching stats' });
    }
};

export const getGoalEvolution = async (req: AuthRequest, res: Response) => {
    try {
        const userId = Number(req.user.id);
        const userRole = req.user.role;

        let whereClause: any = {};

        if (userRole === 'CLIENT') {
            whereClause = {
                OR: [
                    { createdById: userId },
                    { clientId: userId }
                ]
            };
        } else if (userRole === 'INTERVIEWER') {
            whereClause = {
                collectors: { some: { id: userId } }
            };
        } else if (userRole === 'ADMIN') {
            // Admin sees all
        } else {
            // Supervisor?
            whereClause = { createdById: userId };
        }

        const surveys = await prisma.survey.findMany({
            where: whereClause,
            select: { id: true, goal: true, createdAt: true }
        });

        const totalGoal = surveys.reduce((acc, s) => acc + (s.goal || 0), 0);
        const surveyIds = surveys.map(s => s.id);

        const responses = await prisma.response.findMany({
            where: { surveyId: { in: surveyIds } },
            select: { createdAt: true },
            orderBy: { createdAt: 'asc' }
        });

        // Aggregate by day
        const dailyCounts: { [key: string]: number } = {};

        // Initialize with survey creation dates to ensure start of graph? 
        // Or just use response dates. Let's use response dates + today.

        responses.forEach(r => {
            const dateStr = format(r.createdAt, 'yyyy-MM-dd');
            dailyCounts[dateStr] = (dailyCounts[dateStr] || 0) + 1;
        });

        // Create cumulative data
        const data: { date: string; value: number }[] = [];
        let cumulative = 0;

        // Get range of dates
        const dates = Object.keys(dailyCounts).sort();
        if (dates.length === 0 && surveys.length > 0) {
            // No responses yet
            data.push({ date: format(new Date(), 'yyyy-MM-dd'), value: 0 });
        } else {
            // Fill in gaps? For now, just show days with activity or simple accumulation
            // Better to fill gaps for a smooth line
            if (dates.length > 0) {
                let currentDate = parseISO(dates[0]!);
                const endDate = new Date();

                while (isBefore(currentDate, endDate) || format(currentDate, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd')) {
                    const dateStr = format(currentDate, 'yyyy-MM-dd');
                    cumulative += (dailyCounts[dateStr] || 0);
                    data.push({ date: dateStr, value: cumulative });
                    currentDate = addDays(currentDate, 1);
                }
            }
        }

        res.json({
            goal: totalGoal,
            evolution: data
        });

    } catch (error) {
        console.error('Error fetching goal evolution:', error);
        res.status(500).json({ error: 'Error fetching goal evolution' });
    }
};

export const getDashboardSurveys = async (req: AuthRequest, res: Response) => {
    try {
        const userId = Number(req.user.id);
        const userRole = req.user.role;

        let whereClause: any = {
            status: 'AT' // Only active surveys
        };

        if (userRole === 'CLIENT') {
            whereClause.OR = [
                { createdById: userId },
                { clientId: userId }
            ];
        } else if (userRole === 'INTERVIEWER') {
            whereClause.collectors = { some: { id: userId } };
        } else if (userRole === 'SUPERVISOR') {
            // Supervisor sees created by them?
            whereClause.createdById = userId;
        }

        const surveys = await prisma.survey.findMany({
            where: whereClause,
            include: {
                collectors: {
                    select: { id: true, name: true }
                },
                client: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const dashboardData = [];

        for (const survey of surveys) {
            const collectorsData = [];
            const goalPerCollector = survey.goalPerCollector || 0;

            for (const collector of survey.collectors) {
                // If interviewer, only show themselves?
                if (userRole === 'INTERVIEWER' && collector.id !== userId) continue;

                const count = await prisma.response.count({
                    where: {
                        surveyId: survey.id,
                        interviewerId: collector.id
                    }
                });

                collectorsData.push({
                    id: collector.id,
                    name: collector.name,
                    count: count,
                    goal: goalPerCollector
                });
            }

            const totalCount = await prisma.response.count({
                where: { surveyId: survey.id }
            });

            dashboardData.push({
                id: survey.id,
                title: survey.title,
                description: survey.description,
                goal: survey.goal,
                totalCount: totalCount,
                clientName: survey.client?.name,
                collectors: collectorsData
            });
        }

        res.json(dashboardData);

    } catch (error) {
        console.error('Error fetching dashboard surveys:', error);
        res.status(500).json({ error: 'Error fetching dashboard surveys' });
    }
};
