
import { Router } from 'express';
import { createCollector, getCollectors, updateCollector, deleteCollector } from '../controllers/collectorController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', authorize(['ADMIN', 'CLIENT']), createCollector);
router.get('/', authorize(['ADMIN', 'CLIENT']), getCollectors);
router.put('/:id', authorize(['ADMIN', 'CLIENT']), updateCollector);
router.delete('/:id', authorize(['ADMIN', 'CLIENT']), deleteCollector);

export default router;
