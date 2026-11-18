import * as reporteService from '../services/reporte.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const resumen = asyncHandler(async (req, res) => {
  const data = await reporteService.resumen({
    fechaDesde: req.query.fecha_desde,
    fechaHasta: req.query.fecha_hasta,
  });
  res.json({ ok: true, data });
});

export const ventas = asyncHandler(async (req, res) => {
  const data = await reporteService.ventas({
    fechaDesde: req.query.fecha_desde,
    fechaHasta: req.query.fecha_hasta,
  });
  res.json({ ok: true, data });
});

export const compras = asyncHandler(async (req, res) => {
  const data = await reporteService.compras({
    fechaDesde: req.query.fecha_desde,
    fechaHasta: req.query.fecha_hasta,
  });
  res.json({ ok: true, data });
});
