import { Router } from 'express';
import productoRoutes from './producto.routes.js';
import metodoPagoRoutes from './metodo-pago.routes.js';
import origenPagoRoutes from './origen-pago.routes.js';
import insumoRoutes from './insumo.routes.js';
import varianteRoutes from './variante.routes.js';
import extraRoutes from './extra.routes.js';
import recetaRoutes from './receta.routes.js';
import compraRoutes from './compra.routes.js';

const router = Router();

router.use('/productos', productoRoutes);
router.use('/metodos-pago', metodoPagoRoutes);
router.use('/origenes-pago', origenPagoRoutes);
router.use('/insumos', insumoRoutes);
router.use('/variantes', varianteRoutes);
router.use('/extras', extraRoutes);
router.use('/recetas', recetaRoutes);
router.use('/compras', compraRoutes);

export default router;
