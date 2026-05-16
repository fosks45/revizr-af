/**
 * Simple forward-only migration runner.
 * Reads all *.sql files from db/migrations/ in filename order,
 * tracks applied migrations in a `schema_migrations` table.
 *
 * Usage:  npx tsx db/migrate.ts
 */
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Client } from 'pg';

async function run() {
  const client = new Client({ connectionString: process.env['DATABASE_URL'] });
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const migrationsDir = join(import.meta.dirname ?? __dirname, 'migrations');
  const files = (await readdir(migrationsDir))
    .filter(f => f.endsWith('.sql'))
    .sort();

  const { rows } = await client.query<{ filename: string }>(
    'SELECT filename FROM schema_migrations'
  );
  const applied = new Set(rows.map(r => r.filename));

  let count = 0;
  for (const file of files) {
    if (applied.has(file)) continue;

    console.log(`Applying ${file}...`);
    const sql = await readFile(join(migrationsDir, file), 'utf8');

    // Run only the UP section (everything before -- DOWN)
    const upSection = sql.split(/^-- ={10,}\s*\n-- DOWN/m)[0] ?? sql;

    await client.query('BEGIN');
    try {
      await client.query(upSection);
      await client.query(
        'INSERT INTO schema_migrations (filename) VALUES ($1)',
        [file]
      );
      await client.query('COMMIT');
      console.log(`  ✓ ${file}`);
      count++;
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`  ✗ ${file} failed:`, err);
      process.exit(1);
    }
  }

  if (count === 0) {
    console.log('No new migrations to apply.');
  } else {
    console.log(`\nApplied ${count} migration(s).`);
  }

  await client.end();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
