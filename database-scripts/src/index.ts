import { Database } from "bun:sqlite";
import { readFileSync, mkdirSync } from "fs";
import { resolve } from "path";

const scriptPath = process.argv[2];

if (!scriptPath) {
  console.error("Usage: bun database/run_migration.ts <path-to-sql-file>");
  process.exit(1);
}

const sqliteDir = resolve(import.meta.dir, "../../database");
mkdirSync(sqliteDir, { recursive: true });

const dbPath = resolve(sqliteDir, "wam.db");
const sqlPath = resolve(scriptPath);

const sql = readFileSync(sqlPath, "utf-8");

const db = new Database(dbPath, { create: true });
db.query("PRAGMA foreign_keys = ON;").run();
db.query("PRAGMA journal_mode = WAL;").run();

const statements = sql
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

try {
  const migrate = db.transaction(() => {
    for (const statement of statements) {
      db.query(statement).run();
    }
  });
  migrate();
  console.log(`Migration applied: ${sqlPath}`);
  console.log(`Database: ${dbPath}`);
} catch (err) {
  console.error("Migration failed:", err);
  process.exit(1);
} finally {
  db.close();
}
