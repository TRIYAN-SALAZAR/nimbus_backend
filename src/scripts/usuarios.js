import pg from 'pg';
import format from 'pg-format';
import usuarios from '../config/usuarios.json' with { type: 'json' };
import process from 'node:process';

const { Client } = pg;
const DATABASE_URL = process.env.DATABASE_URL;
const GROUP_ROLE = 'rol_cafeteria';
const TABLES = [
  'producto', 'variante', 'extra', 'metodo_pago', 'origen_pago', 'insumo',
  'proveedor', 'cliente', 'compra', 'detalle_compra', 'venta',
  'detalle_venta', 'detalle_venta_extra', 'receta_variante', 'receta_extra',
];

const permissions = {
  gerente_cafe: [
    'GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public',
    'GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public',
  ],
  cajero_matutino: [
    'GRANT SELECT ON TABLE producto, variante, extra, metodo_pago',
    'GRANT SELECT, INSERT ON TABLE venta, detalle_venta, detalle_venta_extra',
    'GRANT USAGE, SELECT ON SEQUENCE detalle_venta_id_detalle_seq',
  ],
  cajero_vespertino: [
    'GRANT SELECT ON TABLE producto, variante, extra, metodo_pago',
    'GRANT SELECT, INSERT ON TABLE venta, detalle_venta, detalle_venta_extra',
    'GRANT UPDATE (folio_nota, requiere_nota) ON TABLE venta',
    'GRANT USAGE, SELECT ON SEQUENCE detalle_venta_id_detalle_seq',
  ],
  barista_1: [
    'GRANT SELECT ON TABLE producto, variante, receta_variante, receta_extra',
  ],
  almacenista: [
    'GRANT SELECT, INSERT, UPDATE ON TABLE insumo',
    'GRANT USAGE, SELECT ON SEQUENCE insumo_id_insumo_seq',
  ],
  comprador: [
    'GRANT SELECT, INSERT ON TABLE compra, detalle_compra',
    'GRANT SELECT ON TABLE proveedor, insumo, origen_pago',
    'GRANT USAGE, SELECT ON SEQUENCE compra_id_compra_seq',
  ],
  contador: [
    'GRANT SELECT ON TABLE compra, detalle_compra, venta, detalle_venta',
  ],
  auditor: [
    'GRANT SELECT ON ALL TABLES IN SCHEMA public',
  ],
  analista_ventas: [
    'GRANT SELECT ON TABLE venta, detalle_venta, producto, variante',
  ],
  capturista_menu: [
    'GRANT SELECT, INSERT, UPDATE ON TABLE producto, variante, extra',
    'GRANT USAGE, SELECT ON SEQUENCE producto_id_producto_seq',
    'GRANT USAGE, SELECT ON SEQUENCE variante_id_variante_seq',
    'GRANT USAGE, SELECT ON SEQUENCE extra_id_extra_seq',
  ],
};

function requireDatabaseUrl() {
  if (!DATABASE_URL) {
    throw new Error('Falta DATABASE_URL en el archivo .env');
  }
}

function roleIdentifier(role) {
  if (!/^[a-z_][a-z0-9_]*$/.test(role)) {
    throw new Error(`Nombre de rol inválido: ${role}`);
  }
  return format.ident(role);
}

function passwordFor(username) {
  const envName = `USUARIO_PASSWORD_${username.toUpperCase()}`;
  return process.env[envName] || process.env.DEFAULT_USER_PASSWORD;
}

async function ensureGroupRole(client) {
  const result = await client.query(
    'select 1 from pg_roles where rolname = $1',
    [GROUP_ROLE],
  );
  if (result.rowCount === 0) {
    await client.query(`create role ${roleIdentifier(GROUP_ROLE)} nologin`);
  }
  await client.query(`grant usage on schema public to ${roleIdentifier(GROUP_ROLE)}`);
}

async function ensurePolicies(client) {
  for (const table of TABLES) {
    const policy = await client.query(
      `select 1 from pg_policies where schemaname = 'public' and tablename = $1 and policyname = $2`,
      [table, 'acceso_rol_cafeteria'],
    );
    if (policy.rowCount === 0) {
      await client.query(format(
        'create policy %I on public.%I for all to %I using (true) with check (true)',
        'acceso_rol_cafeteria',
        table,
        GROUP_ROLE,
      ));
    }
  }
}

async function ensureUsers(client) {
  for (const usuario of usuarios) {
    const existing = await client.query(
      'select 1 from pg_roles where rolname = $1',
      [usuario.username],
    );
    if (existing.rowCount === 0) {
      const password = passwordFor(usuario.username);
      if (!password) {
        throw new Error(
          `Falta contraseña para ${usuario.username}. Define ${`USUARIO_PASSWORD_${usuario.username.toUpperCase()}`} o DEFAULT_USER_PASSWORD.`,
        );
      }
      await client.query(format(
        'create role %I login password %L',
        usuario.username,
        password,
      ));
      console.log(`Usuario creado: ${usuario.username}`);
    } else {
      console.log(`Usuario existente, se conserva: ${usuario.username}`);
    }
    await client.query(format(
      'grant %I to %I',
      GROUP_ROLE,
      usuario.username,
    ));
  }
}

async function grantPermissions(client) {
  for (const usuario of usuarios) {
    for (const statement of permissions[usuario.username] || []) {
      await client.query(`${statement} TO ${roleIdentifier(usuario.username)}`);
    }
  }
}

async function createUsers(client) {
  await ensureGroupRole(client);
  await ensurePolicies(client);
  await ensureUsers(client);
  await grantPermissions(client);
}

async function listUsers(client) {
  const result = await client.query(`
    select
      r.rolname as usuario,
      r.rolcanlogin as login,
      r.rolconnlimit as limite_conexiones,
      r.rolvaliduntil as valido_hasta,
      exists (
        select 1
        from pg_auth_members m
        join pg_roles g on g.oid = m.roleid
        where m.member = r.oid and g.rolname = $1
      ) as miembro_rol_cafeteria
    from pg_roles r
    where r.rolname = any($2::text[])
    order by r.rolname
  `, [GROUP_ROLE, usuarios.map(({ username }) => username)]);
  console.table(result.rows);
}

async function deleteUser(client, username) {
  if (!usuarios.some((usuario) => usuario.username === username)) {
    throw new Error(`Usuario no definido en usuarios.json: ${username}`);
  }
  await client.query(`drop owned by ${roleIdentifier(username)}`);
  await client.query(`drop role ${roleIdentifier(username)}`);
  console.log(`Usuario eliminado: ${username}`);
}

async function main() {
  requireDatabaseUrl();
  const action = process.argv[2] || 'listar';
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    if (action === 'crear') {
      await createUsers(client);
    } else if (action === 'listar') {
      await listUsers(client);
    } else if (action === 'eliminar') {
      const username = process.argv[3];
      if (!username) throw new Error('Uso: npm run usuarios -- eliminar nombre_usuario');
      await deleteUser(client, username);
    } else {
      throw new Error('Acción no válida. Usa crear, listar o eliminar.');
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});
