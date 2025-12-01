"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const auth_1 = require("../middleware/auth");
const userController_1 = require("../controllers/userController");
const router = express_1.default.Router();
// Get users (Admin only)
router.get('/', auth_1.authenticate, (0, auth_1.authorize)(['ADMIN']), userController_1.getUsers);
// Reset password (Admin and Client)
router.post('/:id/reset-password', auth_1.authenticate, (0, auth_1.authorize)(['ADMIN', 'CLIENT']), async (req, res) => {
    try {
        const { id } = req.params;
        const userId = parseInt(String(id));
        const requestorId = req.user.id;
        const requestorRole = req.user.role;
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (requestorRole === 'CLIENT') {
            if (user.managerId !== requestorId) {
                return res.status(403).json({ error: 'Access denied. You can only reset passwords for your own collectors.' });
            }
        }
        // Generate 4-digit PIN
        const pin = Math.floor(1000 + Math.random() * 9000).toString();
        const hashedPassword = await bcryptjs_1.default.hash(pin, 10);
        await prisma_1.default.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
                mustChangePassword: true
            }
        });
        res.json({ password: pin });
    }
    catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ error: 'Error resetting password' });
    }
});
exports.default = router;
//# sourceMappingURL=userRoutes.js.map