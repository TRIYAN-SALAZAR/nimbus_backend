import * as ventaService from '../services/venta.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

function validarDetalles(detalles) {
  if (!Array.isArray(detalles) || detalles.length === 0) {
    throw new AppError('El campo "detalles" debe ser un arreglo no vacío', 400);
  }
  for (const detalle of detalles) {
    if (detalle.id_variante === undefined) {
      throw new AppError('Cada detalle debe incluir "id_variante"', 400);
    }
    if (!Number.isInteger(detalle.cantidad) || detalle.cantidad <= 0) {
      throw new AppError('Cada detalle debe tener una "cantidad" entera mayor que cero', 400);
    }
    if (detalle.extras !== undefined && !Array.isArray(detalle.extras)) {
      throw new AppError('El campo "extras" debe ser un arreglo', 400);
    }
    for (const extra of detalle.extras ?? []) {
      if (extra.id_extra === undefined) {
        throw new AppError('Cada extra debe incluir "id_extra"', 400);
      }
      if (!Number.isInteger(extra.cantidad) || extra.cantidad <= 0) {
        throw new AppError('La cantidad de cada extra debe ser un entero mayor que cero', 400);
      }
    }
  }
}

export const listar = asyncHandler(async (req, res) => {
  const data = await ventaService.listar({
    fechaDesde: req.query.fecha_desde,
    fechaHasta: req.query.fecha_hasta,
  });
  res.json({ ok: true, data });
});

export const obtener = asyncHandler(async (req, res) => {
  const data = await ventaService.obtenerPorId(req.params.id);
  res.json({ ok: true, data });
});

export const registrar = asyncHandler(async (req, res) => {
  const {
    consumo_local,
    requiere_nota,
    folio_nota,
    id_metodo_pago,
    id_cliente,
    detalles,
  } = req.body ?? {};

  if (typeof consumo_local !== 'boolean') {
    throw new AppError('El campo "consumo_local" debe ser booleano', 400);
  }
  if (typeof requiere_nota !== 'boolean') {
    throw new AppError('El campo "requiere_nota" debe ser booleano', 400);
  }
  if (id_metodo_pago === undefined) {
    throw new AppError('El campo "id_metodo_pago" es obligatorio', 400);
  }
  if (requiere_nota && !folio_nota) {
    throw new AppError('El campo "folio_nota" es obligatorio cuando requiere_nota es verdadero', 400);
  }
  validarDetalles(detalles);

  const data = await ventaService.registrar({
    venta: {
      consumo_local,
      requiere_nota,
      folio_nota,
      id_metodo_pago,
      id_cliente,
    },
    detalles,
  });
  res.status(201).json({ ok: true, data });
});
