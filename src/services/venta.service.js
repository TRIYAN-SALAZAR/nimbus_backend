import { supabase } from '../config/supabase.js';
import { fromSupabase } from '../utils/AppError.js';

const SELECT = `
  *,
  detalle_venta(
    *,
    variante(*),
    detalle_venta_extra(*, extra(*))
  ),
  metodo_pago(*),
  cliente(*)
`;

export async function listar({ fechaDesde, fechaHasta } = {}) {
  let query = supabase
    .from('venta')
    .select(SELECT)
    .order('fecha_hora', { ascending: false });
  if (fechaDesde) query = query.gte('fecha_hora', fechaDesde);
  if (fechaHasta) query = query.lte('fecha_hora', fechaHasta);
  const { data, error } = await query;
  if (error) throw fromSupabase(error);
  return data;
}

export async function obtenerPorId(id) {
  const { data, error } = await supabase
    .from('venta')
    .select(SELECT)
    .eq('id_venta', id)
    .single();
  if (error) throw fromSupabase(error);
  return data;
}

export async function registrar({ venta, detalles }) {
  const { data, error } = await supabase.rpc('registrar_venta', {
    p_venta: venta,
    p_detalles: detalles,
  });
  if (error) throw fromSupabase(error);
  return obtenerPorId(data.id_venta);
}
