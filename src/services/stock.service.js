import { supabase } from '../config/supabase.js';
import { fromSupabase } from '../utils/AppError.js';

export async function listar() {
  const { data, error } = await supabase
    .from('v_stock_insumo')
    .select('*')
    .order('nombre');
  if (error) throw fromSupabase(error);
  return data;
}
