import { Router } from 'express';
import productoRoutes from './producto.routes.js';
// Agrega aquí el resto de módulos: venta, compra, insumo, etc.

const router = Router();

router.use('/productos', productoRoutes);

export default router;
