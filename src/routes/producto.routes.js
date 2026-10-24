import { Router } from 'express';
import * as ctrl from '../controllers/producto.controller.js';

const router = Router();

router.get('/', ctrl.listar);
router.get('/:id', ctrl.obtener);
router.post('/', ctrl.crear);
router.patch('/:id', ctrl.actualizar);
router.delete('/:id', ctrl.desactivar);

export default router;
