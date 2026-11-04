import { Router } from 'express';
import * as ctrl from '../controllers/receta.controller.js';

const router = Router();

router.get('/variantes/:id_variante', ctrl.listarPorVariante);
router.post('/variantes/:id_variante', ctrl.agregarAVariante);
router.delete('/variantes/:id_variante/insumos/:id_insumo', ctrl.quitarDeVariante);

router.get('/extras/:id_extra', ctrl.listarPorExtra);
router.post('/extras/:id_extra', ctrl.agregarAExtra);
router.delete('/extras/:id_extra/insumos/:id_insumo', ctrl.quitarDeExtra);

export default router;
