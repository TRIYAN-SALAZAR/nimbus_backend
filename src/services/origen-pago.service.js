import { supabase } from '../config/supabase.js';
import { fromSupabase } from '../utils/AppError.js';

const TABLE = 'origen_pago';

export async function listar() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('nombre');
  if (error) throw fromSupabase(error);
  return data;
}

export async function crear({ nombre, tipo }) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ nombre, tipo })
    .select()
    .single();
  if (error) throw fromSupabase(error);
  return data;
}

export async function actualizar(id, campos) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(campos)
    .eq('id_origen_pago', id)
    .select()
    .single();
  if (error) throw fromSupabase(error);
  return data;
}

export async function eliminar(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id_origen_pago', id)
    .select()
    .single();
  if (error) throw fromSupabase(error);
  return data;
}
