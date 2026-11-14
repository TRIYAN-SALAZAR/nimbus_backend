import app from './app.js';
let env = process.env;

app.listen(env.PORT, () => {
  console.log(`Servidor en http://localhost:${env.port}`);
});
