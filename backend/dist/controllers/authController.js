"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const register = async (req, res) => {
    try {
        const { email, password, name, role } = req.body;
        const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: role || 'INTERVIEWER',
            },
        });
        res.status(201).json({ message: 'User created successfully', userId: user.id });
    }
    catch (error) {
        res.status(500).json({ error: 'Error registering user' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '1d' });
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
                mustChangePassword: user.mustChangePassword
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Error logging in' });
    }
};
exports.login = login;
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        // @ts-ignore
        const userId = req.user.id;
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const isMatch = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Senha atual incorreta' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await prisma_1.default.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
                mustChangePassword: false
            }
        });
        res.json({ message: 'Password changed successfully' });
    }
    catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ error: 'Error changing password' });
    }
};
exports.changePassword = changePassword;
//# sourceMappingURL=authController.js.map