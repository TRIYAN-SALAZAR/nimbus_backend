import { Router } from 'express';
import * as ctrl from '../controllers/metodo-pago.controller.js';

const router = Router();

router.get('/', ctrl.listar);
router.post('/', ctrl.crear);

export default router;
