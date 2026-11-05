import { Router } from 'express';
import * as ctrl from '../controllers/venta.controller.js';

const router = Router();

router.get('/', ctrl.listar);
router.get('/:id', ctrl.obtener);
router.post('/', ctrl.registrar);

export default router;
