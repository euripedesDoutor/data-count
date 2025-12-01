import { Router } from 'express';
import { getStats, getGoalEvolution, getDashboardSurveys } from '../controllers/statsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getStats);
router.get('/evolution', getGoalEvolution);
router.get('/dashboard-surveys', getDashboardSurveys);

export default router;
