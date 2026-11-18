import { Router } from 'express';
import * as ctrl from '../controllers/reporte.controller.js';

const router = Router();

router.get('/resumen', ctrl.resumen);
router.get('/ventas', ctrl.ventas);
router.get('/compras', ctrl.compras);

export default router;
