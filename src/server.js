import app from './app.js';
import { env } from './config/env.js';

app.listen(env.port, () => {
  console.log(`Servidor en http://localhost:${env.port} (${env.nodeEnv})`);
});
