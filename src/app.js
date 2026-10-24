import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middlewares/errorHandler.js';
import { supabase } from './config/supabase.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', async (req, res) => {
  const { error } = await supabase.from('metodo_pago').select('id_metodo_pago', { head: true, count: 'exact' });
  if (error) return res.status(500).json({ ok: false, db: 'error', message: error.message });
  res.json({ ok: true, db: 'conectada' });
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
