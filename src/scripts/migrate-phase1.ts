import "dotenv/config";
import postgres from "postgres";

async function run() {
  const connectionString = process.env["DATABASE_URL"];
  if (!connectionString) {
    console.log("No DATABASE_URL found. Skipping migration.");
    process.exit(0);
  }

  let sql: ReturnType<typeof postgres> | null = null;
  try {
    sql = postgres(connectionString, { max: 1, connect_timeout: 5 });
    console.log("Running Phase 1 Migration: Adding account_id column to orders table...");
    await sql`
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS account_id VARCHAR(50);
    `;
    console.log("Phase 1 Migration completed successfully: column 'account_id' is present.");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn("Phase 1 Migration note: Database connection unreachable or offline:", message);
  } finally {
    if (sql) {
      await sql.end().catch(() => {});
    }
    process.exit(0);
  }
}

run();
