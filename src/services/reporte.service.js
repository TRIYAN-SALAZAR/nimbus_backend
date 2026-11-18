import { supabase } from '../config/supabase.js';
import { fromSupabase } from '../utils/AppError.js';

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function normalizarFechaDesde(valor) {
  if (!valor) return null;
  return valor.includes('T') ? valor : `${valor}T00:00:00.000Z`;
}

function normalizarFechaHasta(valor) {
  if (!valor) return null;
  return valor.includes('T') ? valor : `${valor}T23:59:59.999Z`;
}

function obtenerVentas({ fechaDesde, fechaHasta }) {
  let query = supabase
    .from('venta')
    .select(`
      id_venta,
      fecha_hora,
      total,
      consumo_local,
      metodo_pago(nombre),
      detalle_venta(
        cantidad,
        precio_cobrado,
        variante(
          tamano,
          producto(nombre)
        )
      )
    `)
    .order('fecha_hora', { ascending: false });

  const desde = normalizarFechaDesde(fechaDesde);
  const hasta = normalizarFechaHasta(fechaHasta);
  if (desde) query = query.gte('fecha_hora', desde);
  if (hasta) query = query.lte('fecha_hora', hasta);
  return query;
}

function obtenerCompras({ fechaDesde, fechaHasta }) {
  let query = supabase
    .from('compra')
    .select(`
      id_compra,
      fecha,
      total,
      proveedor(nombre),
      detalle_compra(
        cantidad,
        precio,
        insumo(nombre)
      )
    `)
    .order('fecha', { ascending: false })
    .order('id_compra', { ascending: false });
  if (fechaDesde) query = query.gte('fecha', fechaDesde);
  if (fechaHasta) query = query.lte('fecha', fechaHasta);
  return query;
}

export async function ventas({ fechaDesde, fechaHasta } = {}) {
  const { data, error } = await obtenerVentas({ fechaDesde, fechaHasta });
  if (error) throw fromSupabase(error);

  const ventasRegistradas = data || [];
  const totalVentas = ventasRegistradas.reduce(
    (total, venta) => total + toNumber(venta.total),
    0,
  );

  const porMetodoPago = {};
  const porProducto = {};

  for (const venta of ventasRegistradas) {
    const metodo = venta.metodo_pago?.nombre || 'Sin método';
    porMetodoPago[metodo] = roundMoney(
      toNumber(porMetodoPago[metodo]) + toNumber(venta.total),
    );

    for (const detalle of venta.detalle_venta || []) {
      const producto = detalle.variante?.producto?.nombre || 'Producto sin nombre';
      const tamano = detalle.variante?.tamano;
      const nombre = tamano ? `${producto} ${tamano}` : producto;
      const importe = toNumber(detalle.precio_cobrado) * toNumber(detalle.cantidad);
      porProducto[nombre] = roundMoney(
        toNumber(porProducto[nombre]) + importe,
      );
    }
  }

  return {
    cantidad: ventasRegistradas.length,
    total: roundMoney(totalVentas),
    ticket_promedio: roundMoney(
      ventasRegistradas.length > 0 ? totalVentas / ventasRegistradas.length : 0,
    ),
    por_metodo_pago: porMetodoPago,
    por_producto: porProducto,
  };
}

export async function compras({ fechaDesde, fechaHasta } = {}) {
  const { data, error } = await obtenerCompras({ fechaDesde, fechaHasta });
  if (error) throw fromSupabase(error);

  const comprasRegistradas = data || [];
  const totalCompras = comprasRegistradas.reduce(
    (total, compra) => total + toNumber(compra.total),
    0,
  );

  const porProveedor = {};
  const porInsumo = {};

  for (const compra of comprasRegistradas) {
    const proveedor = compra.proveedor?.nombre || 'Sin proveedor';
    porProveedor[proveedor] = roundMoney(
      toNumber(porProveedor[proveedor]) + toNumber(compra.total),
    );

    for (const detalle of compra.detalle_compra || []) {
      const insumo = detalle.insumo?.nombre || 'Insumo sin nombre';
      const importe = toNumber(detalle.precio) * toNumber(detalle.cantidad);
      porInsumo[insumo] = roundMoney(
        toNumber(porInsumo[insumo]) + importe,
      );
    }
  }

  return {
    cantidad: comprasRegistradas.length,
    total: roundMoney(totalCompras),
    por_proveedor: porProveedor,
    por_insumo: porInsumo,
  };
}

export async function resumen({ fechaDesde, fechaHasta } = {}) {
  const [ventasData, comprasData] = await Promise.all([
    ventas({ fechaDesde, fechaHasta }),
    compras({ fechaDesde, fechaHasta }),
  ]);

  return {
    ventas: ventasData,
    compras: comprasData,
    utilidad_bruta: roundMoney(ventasData.total - comprasData.total),
  };
}
