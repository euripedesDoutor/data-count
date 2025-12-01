"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClient = exports.updateClient = exports.getClients = exports.createClient = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const createClient = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const client = await prisma_1.default.user.create({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create client' });
    }
};
exports.createClient = createClient;
const getClients = async (req, res) => {
    try {
        const clients = await prisma_1.default.user.findMany({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch clients' });
    }
};
exports.getClients = getClients;
const updateClient = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password } = req.body;
        const data = { name, email };
        if (password) {
            data.password = await bcryptjs_1.default.hash(password, 10);
            data.mustChangePassword = true;
        }
        const client = await prisma_1.default.user.update({
            where: { id: Number(id) },
            data,
        });
        const { password: _, ...clientData } = client;
        res.json(clientData);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update client' });
    }
};
exports.updateClient = updateClient;
const deleteClient = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.user.delete({ where: { id: Number(id) } });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete client' });
    }
};
exports.deleteClient = deleteClient;
//# sourceMappingURL=clientController.js.map