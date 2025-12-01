"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSurveyHeatmap = exports.getSurveyReport = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const getSurveyReport = async (req, res) => {
    try {
        console.log('getSurveyReport called with params:', req.params);
        const { id } = req.params;
        const { filterQuestionId, filterAnswer } = req.query;
        const userId = Number(req.user.id);
        const userRole = req.user.role;
        // 1. Fetch Survey and Questions
        const survey = await prisma_1.default.survey.findUnique({
            where: { id: Number(id) },
            include: {
                questions: {
                    orderBy: { order: 'asc' }
                }
            }
        });
        if (!survey) {
            return res.status(404).json({ error: 'Survey not found' });
        }
        // 2. Check Access Rights
        if (userRole === 'CLIENT') {
            const isCreator = survey.createdById === userId;
            const isClient = survey.clientId === userId;
            if (!isCreator && !isClient) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }
        // 3. Fetch Responses
        // If filtering is applied, we first find the response IDs that match the filter
        let matchingResponseIds = null;
        if (filterQuestionId && filterAnswer) {
            const allResponses = await prisma_1.default.response.findMany({
                where: { surveyId: Number(id) },
                select: { id: true, data: true }
            });
            matchingResponseIds = allResponses
                .filter((r) => {
                const answer = r.data[String(filterQuestionId)];
                // Handle array answers (Multiple Choice) or single values
                if (Array.isArray(answer)) {
                    return answer.includes(String(filterAnswer));
                }
                return String(answer) === String(filterAnswer);
            })
                .map((r) => r.id);
        }
        // Now fetch the actual responses to aggregate (filtered or all)
        const whereClause = { surveyId: Number(id) };
        if (matchingResponseIds !== null) {
            whereClause.id = { in: matchingResponseIds };
        }
        const responses = await prisma_1.default.response.findMany({
            where: whereClause,
            select: { data: true }
        });
        // 4. Aggregate Data
        const totalResponses = responses.length;
        const questionStats = survey.questions.map((question) => {
            const stats = {
                id: question.id,
                text: question.text,
                type: question.type,
                total: totalResponses,
                answers: {}
            };
            if (question.type === 'SINGLE_CHOICE' || question.type === 'MULTIPLE_CHOICE') {
                // Initialize counts for all options
                let options = [];
                // Normalize options to an array
                if (typeof question.options === 'string') {
                    try {
                        options = JSON.parse(question.options);
                    }
                    catch (e) {
                        console.error('Error parsing options string:', e);
                        options = [];
                    }
                }
                else if (Array.isArray(question.options)) {
                    options = question.options;
                }
                // Helper to extract text and value from option
                const getOptionDetails = (opt) => {
                    if (typeof opt === 'object' && opt !== null) {
                        const text = opt.text || opt.label || JSON.stringify(opt);
                        const value = String(opt.value !== undefined ? opt.value : text);
                        return { text, value };
                    }
                    if (typeof opt === 'string') {
                        if (opt.trim().startsWith('{')) {
                            try {
                                const parsed = JSON.parse(opt);
                                const text = parsed.text || parsed.label || opt;
                                const value = String(parsed.value !== undefined ? parsed.value : text);
                                return { text, value };
                            }
                            catch {
                                return { text: opt, value: opt };
                            }
                        }
                        return { text: opt, value: opt };
                    }
                    const str = String(opt);
                    return { text: str, value: str };
                };
                const valueToLabel = {};
                if (options.length > 0) {
                    options.forEach((opt) => {
                        const { text, value } = getOptionDetails(opt);
                        stats.answers[text] = 0;
                        valueToLabel[value] = text;
                        // Also map the text itself to the text, in case response stored the text
                        valueToLabel[text] = text;
                    });
                }
                // Count answers
                responses.forEach((r) => {
                    const val = r.data[String(question.id)];
                    if (val) {
                        if (Array.isArray(val)) {
                            val.forEach((v) => {
                                const vStr = String(v);
                                const label = valueToLabel[vStr] || vStr; // Fallback to value if no label found
                                // Initialize if not exists (dynamic answers)
                                if (stats.answers[label] === undefined) {
                                    stats.answers[label] = 0;
                                }
                                stats.answers[label]++;
                            });
                        }
                        else {
                            const vStr = String(val);
                            const label = valueToLabel[vStr] || vStr;
                            if (stats.answers[label] === undefined) {
                                stats.answers[label] = 0;
                            }
                            stats.answers[label]++;
                        }
                    }
                });
                // Calculate percentages
                const answerData = Object.keys(stats.answers).map(key => ({
                    name: key,
                    value: stats.answers[key],
                    percentage: totalResponses > 0 ? Math.round((stats.answers[key] / totalResponses) * 100) : 0
                }));
                stats.data = answerData;
                delete stats.answers; // Clean up intermediate object
            }
            else {
                // Text questions - return list of answers
                const textAnswers = [];
                let filledCount = 0;
                responses.forEach((r) => {
                    const val = r.data[String(question.id)];
                    if (val) {
                        const strVal = String(val).trim();
                        if (strVal) {
                            textAnswers.push(strVal);
                            filledCount++;
                        }
                    }
                });
                stats.textAnswers = textAnswers;
                stats.filledCount = filledCount;
                stats.filledPercentage = totalResponses > 0 ? Math.round((filledCount / totalResponses) * 100) : 0;
            }
            return stats;
        });
        res.json({
            surveyTitle: survey.title,
            totalResponses,
            questions: questionStats
        });
    }
    catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ error: 'Error generating report' });
    }
};
exports.getSurveyReport = getSurveyReport;
const getSurveyHeatmap = async (req, res) => {
    const { id } = req.params;
    const { filterQuestionId, filterAnswer } = req.query;
    try {
        const surveyId = Number(id);
        if (isNaN(surveyId)) {
            return res.status(400).json({ error: 'ID da pesquisa inválido' });
        }
        const whereClause = { surveyId };
        const responses = await prisma_1.default.response.findMany({
            where: whereClause,
            select: {
                id: true,
                location: true,
                data: true
            }
        });
        const locations = [];
        responses.forEach(r => {
            if (!r.location)
                return;
            let loc = null;
            const locData = r.location;
            // Check if location is directly in the object
            if (locData.lat && locData.lng) {
                loc = locData;
            }
            else {
                // Check if location is nested under a key (e.g. question ID)
                const keys = Object.keys(locData);
                for (const key of keys) {
                    if (locData[key] && locData[key].lat && locData[key].lng) {
                        loc = locData[key];
                        break;
                    }
                }
            }
            if (!loc || !loc.lat || !loc.lng)
                return;
            if (filterQuestionId && filterAnswer) {
                const qIdStr = String(filterQuestionId);
                const answer = r.data ? r.data[qIdStr] : null;
                if (answer !== filterAnswer) {
                    return;
                }
            }
            locations.push(loc);
        });
        res.json(locations);
    }
    catch (error) {
        console.error('Error fetching heatmap data:', error);
        res.status(500).json({ error: 'Erro ao buscar dados do mapa de calor' });
    }
};
exports.getSurveyHeatmap = getSurveyHeatmap;
//# sourceMappingURL=reportController.js.map