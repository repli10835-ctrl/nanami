import { sql, initDb } from "../lib/db";
import { seedMenu } from "../lib/seed-data";

async function runAudit() {
  console.log("=== AUDIT STRUKTUR DATA EXISTING: menu_items.groups ===");
  if (sql) {
    try {
      await initDb();
      const rows = await sql`SELECT id, name, groups FROM menu_items LIMIT 10;`;
      console.log(`Ditemukan ${rows.length} records di PostgreSQL menu_items:`);
      console.log(JSON.stringify(rows, null, 2));
    } catch (err) {
      console.log("PostgreSQL query error:", err);
    }
  } else {
    console.log("DATABASE_URL not set in current env. Auditing seedMenu in-memory data:");
    console.log(JSON.stringify(seedMenu.slice(0, 5), null, 2));
  }
}

runAudit();
