import { supabase } from '../config/supabase.js';
import { fromSupabase } from '../utils/AppError.js';

const TABLE = 'metodo_pago';

export async function listar() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('nombre');
  if (error) throw fromSupabase(error);
  return data;
}

export async function crear({ nombre }) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ nombre })
    .select()
    .single();
  if (error) throw fromSupabase(error);
  return data;
}
