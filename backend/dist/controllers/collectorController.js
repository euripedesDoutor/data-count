"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCollector = exports.updateCollector = exports.getCollectors = exports.createCollector = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const createCollector = async (req, res) => {
    try {
        const { name, email, password, clientId } = req.body;
        const userRole = req.user.role;
        const userId = req.user.id;
        let managerId = null;
        if (userRole === 'CLIENT') {
            managerId = userId;
        }
        else if (userRole === 'ADMIN') {
            if (!clientId) {
                return res.status(400).json({ error: 'Client ID is required for Admin' });
            }
            managerId = Number(clientId);
        }
        else {
            return res.status(403).json({ error: 'Access denied' });
        }
        const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const collector = await prisma_1.default.user.create({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create collector' });
    }
};
exports.createCollector = createCollector;
const getCollectors = async (req, res) => {
    try {
        const userRole = req.user.role;
        const userId = req.user.id;
        const { clientId } = req.query;
        let where = { role: 'INTERVIEWER' };
        if (userRole === 'CLIENT') {
            where.managerId = userId;
        }
        else if (userRole === 'ADMIN') {
            if (clientId) {
                where.managerId = Number(clientId);
            }
        }
        else {
            return res.status(403).json({ error: 'Access denied' });
        }
        const collectors = await prisma_1.default.user.findMany({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch collectors' });
    }
};
exports.getCollectors = getCollectors;
const updateCollector = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password } = req.body;
        const userRole = req.user.role;
        const userId = req.user.id;
        const collector = await prisma_1.default.user.findUnique({ where: { id: Number(id) } });
        if (!collector) {
            return res.status(404).json({ error: 'Collector not found' });
        }
        if (userRole === 'CLIENT' && collector.managerId !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const data = { name, email };
        if (password) {
            data.password = await bcryptjs_1.default.hash(password, 10);
            data.mustChangePassword = true;
        }
        const updatedCollector = await prisma_1.default.user.update({
            where: { id: Number(id) },
            data,
        });
        const { password: _, ...collectorData } = updatedCollector;
        res.json(collectorData);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update collector' });
    }
};
exports.updateCollector = updateCollector;
const deleteCollector = async (req, res) => {
    try {
        const { id } = req.params;
        const userRole = req.user.role;
        const userId = req.user.id;
        const collector = await prisma_1.default.user.findUnique({ where: { id: Number(id) } });
        if (!collector) {
            return res.status(404).json({ error: 'Collector not found' });
        }
        if (userRole === 'CLIENT' && collector.managerId !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }
        await prisma_1.default.user.delete({ where: { id: Number(id) } });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete collector' });
    }
};
exports.deleteCollector = deleteCollector;
//# sourceMappingURL=collectorController.js.map