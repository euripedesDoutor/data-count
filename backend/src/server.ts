console.log('Starting server... ');
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/authRoutes';
import surveyRoutes from './routes/surveyRoutes';
import responseRoutes from './routes/responseRoutes';
import clientRoutes from './routes/clientRoutes';
import collectorRoutes from './routes/collectorRoutes';
import userRoutes from './routes/userRoutes';
import statsRoutes from './routes/statsRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/responses', responseRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/collectors', collectorRoutes);
app.use('/api/stats', statsRoutes);

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
        import('fs').then(fs => {
            try {
                fs.writeFileSync('server_status.txt', `Running on port ${PORT} at ${new Date().toISOString()}`);
            } catch (e) {
                console.error('Error writing status file:', e);
            }
        });
    });
} catch (error) {
    console.error('Failed to start server:', error);
}
