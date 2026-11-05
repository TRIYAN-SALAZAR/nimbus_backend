import { supabase } from '../config/supabase.js';
import { fromSupabase } from '../utils/AppError.js';

export async function listar({ fechaDesde, fechaHasta } = {}) {
  let query = supabase
    .from('compra')
    .select('*, detalle_compra(*, insumo(*)), origen_pago(*), proveedor(*)')
    .order('fecha', { ascending: false })
    .order('id_compra', { ascending: false });
  if (fechaDesde) query = query.gte('fecha', fechaDesde);
  if (fechaHasta) query = query.lte('fecha', fechaHasta);
  const { data, error } = await query;
  if (error) throw fromSupabase(error);
  return data;
}

export async function obtenerPorId(id) {
  const { data, error } = await supabase
    .from('compra')
    .select('*, detalle_compra(*, insumo(*)), origen_pago(*), proveedor(*)')
    .eq('id_compra', id)
    .single();
  if (error) throw fromSupabase(error);
  return data;
}

export async function registrar({ compra, detalles }) {
  const { data, error } = await supabase.rpc('registrar_compra', {
    p_compra: compra,
    p_detalles: detalles,
  });
  if (error) throw fromSupabase(error);
  return data;
}
