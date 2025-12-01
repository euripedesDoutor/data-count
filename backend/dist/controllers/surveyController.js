"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloneSurvey = exports.deleteSurvey = exports.updateSurvey = exports.getSurveyById = exports.getSurveys = exports.createSurvey = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const fs_1 = __importDefault(require("fs"));
const createSurvey = async (req, res) => {
    try {
        console.log('createSurvey body:', req.body);
        fs_1.default.appendFileSync('C:/drti/data-count/backend/debug_log_absolute.txt', JSON.stringify(req.body) + '\n');
        const { title, description, questions, clientId, collectorIds, goal } = req.body;
        const userId = Number(req.user.id);
        const userRole = req.user.role;
        let finalClientId = null;
        if (userRole === 'CLIENT') {
            finalClientId = userId;
        }
        else if (userRole === 'ADMIN' && clientId) {
            finalClientId = Number(clientId);
        }
        const surveyData = {
            title,
            description,
            createdById: userId,
            clientId: finalClientId,
            questions: {
                create: questions.map((q, index) => ({
                    text: q.text,
                    type: q.type,
                    options: q.options,
                    order: index,
                })),
            },
            goal: goal ? Number(goal) : 0,
            goalPerCollector: 0, // Will be calculated if collectors are added
        };
        if (collectorIds) {
            surveyData.collectors = {
                connect: collectorIds.map((id) => ({ id: Number(id) }))
            };
            // Calculate goal per collector
            if (surveyData.goal > 0 && collectorIds.length > 0) {
                surveyData.goalPerCollector = Math.ceil(surveyData.goal / collectorIds.length);
            }
        }
        const survey = await prisma_1.default.survey.create({
            data: surveyData,
            include: { questions: true, collectors: true },
        });
        res.status(201).json(survey);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating survey' });
    }
};
exports.createSurvey = createSurvey;
const getSurveys = async (req, res) => {
    try {
        const where = {};
        // If user is CLIENT, only show their surveys
        if (req.user?.role === 'CLIENT') {
            where.OR = [
                { createdById: req.user.id },
                { clientId: req.user.id }
            ];
        }
        else if (req.user?.role === 'INTERVIEWER') {
            where.collectors = { some: { id: req.user.id } };
            where.status = 'AT'; // Only show Active surveys to collectors
        }
        const surveys = await prisma_1.default.survey.findMany({
            where,
            include: {
                questions: true,
                createdBy: { select: { name: true } },
                client: { select: { name: true } },
                collectors: { select: { id: true, name: true } }
            },
            orderBy: [
                { status: 'asc' }, // 'AT' comes before 'IN' alphabetically
                { createdAt: 'desc' }
            ]
        });
        const surveysWithProgress = await Promise.all(surveys.map(async (survey) => {
            let responseCount = 0;
            if (req.user?.role === 'INTERVIEWER') {
                responseCount = await prisma_1.default.response.count({
                    where: {
                        surveyId: survey.id,
                        interviewerId: req.user.id
                    }
                });
            }
            else {
                responseCount = await prisma_1.default.response.count({
                    where: {
                        surveyId: survey.id
                    }
                });
            }
            return { ...survey, responseCount };
        }));
        res.json(surveysWithProgress);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching surveys' });
    }
};
exports.getSurveys = getSurveys;
const getSurveyById = async (req, res) => {
    try {
        const { id } = req.params;
        const survey = await prisma_1.default.survey.findUnique({
            where: { id: Number(id) },
            include: {
                questions: true,
                client: { select: { name: true } },
                collectors: { select: { id: true, name: true } }
            },
        });
        if (!survey) {
            return res.status(404).json({ error: 'Survey not found' });
        }
        // Check ownership if CLIENT
        if (req.user?.role === 'CLIENT') {
            const isCreator = survey.createdById === req.user.id;
            const isClient = survey.clientId === req.user.id;
            if (!isCreator && !isClient) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }
        // Check access if INTERVIEWER
        if (req.user?.role === 'INTERVIEWER') {
            const isAssigned = survey.collectors.some((c) => c.id === req.user.id);
            if (!isAssigned) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }
        res.json(survey);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching survey' });
    }
};
exports.getSurveyById = getSurveyById;
const updateSurvey = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, questions, clientId, collectorIds, status, goal } = req.body;
        const userId = Number(req.user.id);
        // Check ownership
        const existingSurvey = await prisma_1.default.survey.findUnique({ where: { id: Number(id) } });
        if (!existingSurvey)
            return res.status(404).json({ error: 'Survey not found' });
        if (req.user.role === 'CLIENT') {
            const isCreator = existingSurvey.createdById === userId;
            const isClient = existingSurvey.clientId === userId;
            if (!isCreator && !isClient) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }
        if (existingSurvey.status === 'AT') {
            if (status !== 'IN') {
                return res.status(400).json({ error: 'Cannot edit an active survey. Please deactivate it first.' });
            }
        }
        let finalClientId = existingSurvey.clientId;
        if (req.user.role === 'ADMIN' && clientId !== undefined) {
            finalClientId = clientId ? Number(clientId) : null;
        }
        // Transaction to update survey and questions
        const updatedSurvey = await prisma_1.default.$transaction(async (tx) => {
            // Update survey details
            const updateData = {
                title,
                description,
                clientId: finalClientId,
                status, // Allow updating status
                goal: goal !== undefined ? Number(goal) : undefined
            };
            if (collectorIds) {
                updateData.collectors = {
                    set: collectorIds.map((id) => ({ id: Number(id) }))
                };
            }
            // Recalculate goalPerCollector
            const currentSurvey = await tx.survey.findUnique({
                where: { id: Number(id) },
                include: { collectors: true }
            });
            const newGoal = goal !== undefined ? Number(goal) : currentSurvey.goal;
            let newCollectorCount = currentSurvey.collectors.length;
            if (collectorIds) {
                newCollectorCount = collectorIds.length;
            }
            if (newGoal > 0 && newCollectorCount > 0) {
                updateData.goalPerCollector = Math.ceil(newGoal / newCollectorCount);
            }
            else if (newGoal === 0) {
                updateData.goalPerCollector = 0;
            }
            if (newCollectorCount === 0)
                updateData.goalPerCollector = 0;
            const survey = await tx.survey.update({
                where: { id: Number(id) },
                data: updateData,
            });
            if (questions) {
                // Delete existing questions (simple approach for now)
                await tx.question.deleteMany({ where: { surveyId: Number(id) } });
                // Create new questions
                if (questions.length > 0) {
                    await tx.question.createMany({
                        data: questions.map((q, index) => ({
                            surveyId: Number(id),
                            text: q.text,
                            type: q.type,
                            options: q.options,
                            order: index,
                        })),
                    });
                }
            }
            return survey;
        });
        res.json(updatedSurvey);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating survey' });
    }
};
exports.updateSurvey = updateSurvey;
const deleteSurvey = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = Number(req.user.id);
        const survey = await prisma_1.default.survey.findUnique({ where: { id: Number(id) } });
        if (!survey)
            return res.status(404).json({ error: 'Survey not found' });
        if (req.user.role === 'CLIENT') {
            const isCreator = survey.createdById === userId;
            const isClient = survey.clientId === userId;
            if (!isCreator && !isClient) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }
        await prisma_1.default.question.deleteMany({ where: { surveyId: Number(id) } });
        await prisma_1.default.survey.delete({ where: { id: Number(id) } });
        res.json({ message: 'Survey deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error deleting survey' });
    }
};
exports.deleteSurvey = deleteSurvey;
const cloneSurvey = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = Number(req.user.id);
        const userRole = req.user.role;
        // Fetch original survey with questions
        const originalSurvey = await prisma_1.default.survey.findUnique({
            where: { id: Number(id) },
            include: { questions: true }
        });
        if (!originalSurvey) {
            return res.status(404).json({ error: 'Survey not found' });
        }
        // Check access rights
        if (userRole === 'CLIENT') {
            const isCreator = originalSurvey.createdById === userId;
            const isClient = originalSurvey.clientId === userId;
            if (!isCreator && !isClient) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }
        // Create new survey
        const newSurvey = await prisma_1.default.survey.create({
            data: {
                title: `${originalSurvey.title} (Cópia)`,
                description: originalSurvey.description,
                createdById: userId, // The user cloning it becomes the owner
                clientId: originalSurvey.clientId, // Keep the same client association
                questions: {
                    create: originalSurvey.questions.map((q) => ({
                        text: q.text,
                        type: q.type,
                        options: q.options,
                        order: q.order,
                    }))
                }
            },
            include: { questions: true }
        });
        res.status(201).json(newSurvey);
    }
    catch (error) {
        console.error('Error cloning survey:', error);
        res.status(500).json({ error: 'Error cloning survey' });
    }
};
exports.cloneSurvey = cloneSurvey;
//# sourceMappingURL=surveyController.js.map