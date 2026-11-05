import { Router } from 'express';
import * as ctrl from '../controllers/stock.controller.js';

const router = Router();

router.get('/', ctrl.listar);

export default router;
