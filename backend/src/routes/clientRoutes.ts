import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { createClient, getClients, updateClient, deleteClient } from '../controllers/clientController';

const router = Router();

// Only ADMIN can manage clients
router.use(authenticate);
router.use(authorize(['ADMIN']));

router.post('/', createClient);
router.get('/', getClients);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

export default router;
