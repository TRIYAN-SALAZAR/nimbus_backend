import { Router } from 'express';
import productoRoutes from './producto.routes.js';
import metodoPagoRoutes from './metodo-pago.routes.js';
import origenPagoRoutes from './origen-pago.routes.js';

const router = Router();

router.use('/productos', productoRoutes);
router.use('/metodos-pago', metodoPagoRoutes);
router.use('/origenes-pago', origenPagoRoutes);

export default router;
