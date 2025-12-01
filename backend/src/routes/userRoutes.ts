import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { authenticate, authorize } from '../middleware/auth';
import { getUsers } from '../controllers/userController';

const router = express.Router();

// Get users (Admin only)
router.get('/', authenticate, authorize(['ADMIN']), getUsers);

// Reset password (Admin and Client)
router.post('/:id/reset-password', authenticate, authorize(['ADMIN', 'CLIENT']), async (req: any, res) => {
    try {
        const { id } = req.params;
        const userId = parseInt(String(id));
        const requestorId = req.user.id;
        const requestorRole = req.user.role;

        const user = await prisma.user.findUnique({ where: { id: userId } });
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
        const hashedPassword = await bcrypt.hash(pin, 10);

        await prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
                mustChangePassword: true
            }
        });

        res.json({ password: pin });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ error: 'Error resetting password' });
    }
});

export default router;
