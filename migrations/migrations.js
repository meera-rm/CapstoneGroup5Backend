const fs = require('fs');
const path = require('path');
const db = require('../db/dbConfig');

const MIGRATION_FILES = [
  'initial_schema.sql',
  'legacy_tables.sql',
  'logs_pagination_index.sql',
  'google_login.sql',
  'subscriptions.sql',
];

async function runMigrations() {
  try {
    for (const file of MIGRATION_FILES) {
      const sqlFile = path.join(__dirname, file);
      const sql = fs.readFileSync(sqlFile, 'utf8');
      console.log(`Running ${file}...`);
      await db.none(sql);
      console.log(`  ✓ ${file} completed`);
    }
    console.log('\nAll migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

runMigrations();