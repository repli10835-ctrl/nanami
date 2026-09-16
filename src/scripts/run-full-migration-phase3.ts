import { sql, initDb } from "../lib/db";
import { migratePhase3 } from "./migrate-phase3";

async function run() {
  console.log("=== EKSEKUSI MIGRASI FASE 3 KE DATABASE UTAMA ===");
  const result = await migratePhase3();
  console.log("Status Hasil Migrasi:", result);

  if (sql) {
    await initDb();
    console.log("\n=== QUERY HASIL SETELAH MIGRASI (SEMUA 6 PRODUK) ===");
    const rows = await sql`
      SELECT id, name, groups, special_request_enabled 
      FROM menu_items 
      ORDER BY id;
    `;
    console.log(`Jumlah baris di menu_items: ${rows.length}`);
    console.log(JSON.stringify(rows, null, 2));
  } else {
    console.log("Mode in-memory (DATABASE_URL tidak diset). Hasil verifikasi selesai.");
  }
}

run().catch(console.error);
