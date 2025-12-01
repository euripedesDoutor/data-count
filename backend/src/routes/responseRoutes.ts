import { Router } from 'express';
import { submitResponse, getResponses } from '../controllers/responseController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, submitResponse);
router.get('/', authenticate, authorize(['ADMIN', 'SUPERVISOR']), getResponses);

export default router;
