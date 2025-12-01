"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = void 0;
const prisma_js_1 = __importDefault(require("../utils/prisma.js"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const seedDatabase = async (req, res) => {
    try {
        const email = 'admin@datacount.com';
        const password = 'admin123';
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const admin = await prisma_js_1.default.user.upsert({
            where: { email },
            update: {},
            create: {
                email,
                name: 'Admin User',
                password: hashedPassword,
                role: 'ADMIN',
            },
        });
        res.json({ message: 'Database seeded successfully', admin });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to seed database' });
    }
};
exports.seedDatabase = seedDatabase;
//# sourceMappingURL=seedController.js.map