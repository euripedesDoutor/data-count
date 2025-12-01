"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
console.log('Starting server... ');
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const surveyRoutes_1 = __importDefault(require("./routes/surveyRoutes"));
const responseRoutes_1 = __importDefault(require("./routes/responseRoutes"));
const clientRoutes_1 = __importDefault(require("./routes/clientRoutes"));
const collectorRoutes_1 = __importDefault(require("./routes/collectorRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const statsRoutes_1 = __importDefault(require("./routes/statsRoutes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/auth', authRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/surveys', surveyRoutes_1.default);
app.use('/api/responses', responseRoutes_1.default);
app.use('/api/clients', clientRoutes_1.default);
app.use('/api/collectors', collectorRoutes_1.default);
app.use('/api/stats', statsRoutes_1.default);
app.get('/', (req, res) => {
    res.send('DataCount API is running');
});
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
try {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        // Write status file for debugging
        Promise.resolve().then(() => __importStar(require('fs'))).then(fs => {
            try {
                fs.writeFileSync('server_status.txt', `Running on port ${PORT} at ${new Date().toISOString()}`);
            }
            catch (e) {
                console.error('Error writing status file:', e);
            }
        });
    });
}
catch (error) {
    console.error('Failed to start server:', error);
}
//# sourceMappingURL=server.js.map