import { Router } from 'express';
import { createSurvey, getSurveys, getSurveyById, updateSurvey, deleteSurvey } from '../controllers/surveyController';
import { getSurveyReport, getSurveyHeatmap } from '../controllers/reportController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, authorize(['ADMIN', 'SUPERVISOR', 'CLIENT']), createSurvey);
router.get('/', authenticate, getSurveys);
router.get('/:id/report', authenticate, getSurveyReport);
router.get('/:id/heatmap', authenticate, getSurveyHeatmap);
router.get('/:id', authenticate, getSurveyById);
router.put('/:id', authenticate, authorize(['ADMIN', 'SUPERVISOR', 'CLIENT']), updateSurvey);
router.delete('/:id', authenticate, authorize(['ADMIN', 'CLIENT']), deleteSurvey);

export default router;
