"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const getUsers = async (req, res) => {
    try {
        const { role } = req.query;
        const where = {};
        if (role) {
            where.role = role;
        }
        const users = await prisma_1.default.user.findMany({
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
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Error fetching users' });
    }
};
exports.getUsers = getUsers;
//# sourceMappingURL=userController.js.map