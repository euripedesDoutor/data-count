"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResponses = exports.submitResponse = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const submitResponse = async (req, res) => {
    try {
        const { surveyId, data, location } = req.body;
        const interviewerId = req.user.id;
        const response = await prisma_1.default.response.create({
            data: {
                surveyId,
                interviewerId,
                data,
                location,
            },
        });
        res.status(201).json(response);
    }
    catch (error) {
        res.status(500).json({ error: 'Error submitting response' });
    }
};
exports.submitResponse = submitResponse;
const getResponses = async (req, res) => {
    try {
        const { surveyId } = req.query;
        const where = surveyId ? { surveyId: Number(surveyId) } : {};
        const responses = await prisma_1.default.response.findMany({
            where,
            include: { interviewer: { select: { name: true } } },
        });
        res.json(responses);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching responses' });
    }
};
exports.getResponses = getResponses;
//# sourceMappingURL=responseController.js.map