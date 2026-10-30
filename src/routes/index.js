import { Router } from 'express';
import productoRoutes from './producto.routes.js';
import metodoPagoRoutes from './metodo-pago.routes.js';

const router = Router();

router.use('/productos', productoRoutes);
router.use('/metodos-pago', metodoPagoRoutes);

export default router;
