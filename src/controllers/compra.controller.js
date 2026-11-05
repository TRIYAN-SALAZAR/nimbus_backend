import * as compraService from '../services/compra.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

function validarDetalles(detalles) {
  if (!Array.isArray(detalles) || detalles.length === 0) {
    throw new AppError('El campo "detalles" debe ser un arreglo no vacío', 400);
  }
  for (const detalle of detalles) {
    if (detalle.id_insumo === undefined) {
      throw new AppError('Cada detalle debe incluir "id_insumo"', 400);
    }
    if (typeof detalle.cantidad !== 'number' || detalle.cantidad <= 0) {
      throw new AppError('Cada detalle debe tener una "cantidad" mayor que cero', 400);
    }
    if (detalle.precio !== undefined && detalle.precio !== null
      && (typeof detalle.precio !== 'number' || detalle.precio < 0)) {
      throw new AppError('El "precio" debe ser un número mayor o igual a cero', 400);
    }
  }
}

export const listar = asyncHandler(async (req, res) => {
  const data = await compraService.listar({
    fechaDesde: req.query.fecha_desde,
    fechaHasta: req.query.fecha_hasta,
  });
  res.json({ ok: true, data });
});

export const obtener = asyncHandler(async (req, res) => {
  const data = await compraService.obtenerPorId(req.params.id);
  res.json({ ok: true, data });
});

export const registrar = asyncHandler(async (req, res) => {
  const { fecha, notas, id_origen, id_proveedor, detalles } = req.body ?? {};
  if (id_origen === undefined) {
    throw new AppError('El campo "id_origen" es obligatorio', 400);
  }
  validarDetalles(detalles);

  const data = await compraService.registrar({
    compra: { fecha, notas, id_origen, id_proveedor },
    detalles,
  });
  res.status(201).json({ ok: true, data });
});
