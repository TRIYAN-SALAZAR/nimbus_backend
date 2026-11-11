import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const BACKUP_DIRECTORY = path.resolve('respaldos');

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno obligatoria: ${name}`);
  }
  return value;
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: false,
    });

    child.on('error', (error) => {
      if (error.code === 'ENOENT') {
        reject(new Error(`No se encontró "${command}". Instala PostgreSQL y agrega sus binarios al PATH.`));
        return;
      }
      reject(error);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`"${command}" terminó con código ${code ?? 'desconocido'}.`));
    });
  });
}

function getTimestamp() {
  return new Date().toISOString().replaceAll(':', '-').replace(/\.\d{3}Z$/, '');
}

async function createBackup() {
  const databaseUrl = getRequiredEnv('DATABASE_URL');
  await mkdir(BACKUP_DIRECTORY, { recursive: true });

  const output = path.join(BACKUP_DIRECTORY, `cafeteria_${getTimestamp()}.dump`);
  await runCommand('pg_dump', [
    databaseUrl,
    '--schema=public',
    '--no-owner',
    '--no-privileges',
    '--format=custom',
    '--file',
    output,
  ]);

  console.log(`Respaldo creado: ${output}`);
}

async function restoreBackup() {
  const restoreUrl = getRequiredEnv('RESTORE_URL');
  const backupPath = process.argv[3];

  if (!backupPath) {
    throw new Error('Debes indicar el archivo: npm run restaurar -- respaldos/archivo.dump');
  }

  await runCommand('pg_restore', [
    '--dbname',
    restoreUrl,
    '--schema=public',
    '--clean',
    '--if-exists',
    '--no-owner',
    '--no-privileges',
    backupPath,
  ]);

  console.log(`Restauración completada: ${backupPath}`);
}

const operation = process.argv[2] || 'backup';

try {
  if (operation === 'backup') {
    await createBackup();
  } else if (operation === 'restore') {
    await restoreBackup();
  } else {
    throw new Error(`Operación no válida: ${operation}. Usa "backup" o "restore".`);
  }
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
