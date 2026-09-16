import { sql, initDb } from "../lib/db";
import { type OptionGroup, type OptionChoice } from "../lib/store";
import { seedMenu } from "../lib/seed-data";

/**
 * Helper untuk menghasilkan ID deterministik jika ditemukan group/choice tanpa ID.
 */
export function generateDeterministicId(prefix: string, name: string, index: number): string {
  const cleanName = (name || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleanName ? `${prefix}-${cleanName}-${index}` : `${prefix}-${index}`;
}

type RawChoiceInput = {
  id?: string;
  name?: string;
  price?: number;
  priceDelta?: number;
};

type RawGroupInput = {
  id?: string;
  name?: string;
  type?: string;
  enabled?: boolean;
  choices?: RawChoiceInput[];
};

/**
 * Transformasi aman OptionGroup:
 * - Menetapkan default `enabled: true` jika belum ada.
 * - Memastikan field `choices` dan `price` digunakan secara konsisten.
 * - Menjaga ID existing jika ada; generate ID deterministik jika kosong/hilang.
 */
export function upgradeOptionGroups(
  rawGroups: unknown,
  itemKey: string = "item",
): { groups: OptionGroup[]; missingIdCount: number } {
  let groupsArray: RawGroupInput[] = [];
  if (typeof rawGroups === "string") {
    try {
      groupsArray = JSON.parse(rawGroups);
    } catch {
      groupsArray = [];
    }
  } else if (Array.isArray(rawGroups)) {
    groupsArray = rawGroups as RawGroupInput[];
  }

  let missingIdCount = 0;

  const upgraded: OptionGroup[] = groupsArray.map((g: RawGroupInput, gIdx: number) => {
    let groupId = g?.id;
    if (!groupId || typeof groupId !== "string" || groupId.trim() === "") {
      groupId = generateDeterministicId(`grp-${itemKey}`, g?.name || "customization", gIdx + 1);
      missingIdCount++;
    }

    const choicesArray: RawChoiceInput[] = Array.isArray(g?.choices) ? g.choices : [];
    const upgradedChoices: OptionChoice[] = choicesArray.map((c: RawChoiceInput, cIdx: number) => {
      let choiceId = c?.id;
      if (!choiceId || typeof choiceId !== "string" || choiceId.trim() === "") {
        choiceId = generateDeterministicId(`opt-${groupId}`, c?.name || "option", cIdx + 1);
        missingIdCount++;
      }
      return {
        id: choiceId,
        name: String(c?.name || "Option"),
        price: Number(c?.price ?? c?.priceDelta ?? 0),
      };
    });

    return {
      id: groupId,
      name: String(g?.name || "Customization"),
      type: g?.type === "multi" ? ("multi" as const) : ("single" as const),
      enabled: g?.enabled !== undefined ? Boolean(g.enabled) : true,
      choices: upgradedChoices,
    };
  });

  return { groups: upgraded, missingIdCount };
}

/**
 * Audit lengkap seluruh produk untuk mengecek keberadaan ID yang kosong/null/undefined.
 */
export async function auditAllMenuItems() {
  console.log("=========================================================================");
  console.log("AUDIT LENGKAP SELURUH MENU ITEMS (CEK INTEGRITAS ID & GROUPS)");
  console.log("=========================================================================");

  if (sql) {
    await initDb();
    const rows = await sql`SELECT id, name, groups, special_request_enabled FROM menu_items;`;
    let totalGroups = 0;
    let totalChoices = 0;
    let totalMissingIds = 0;

    const auditResults = rows.map((row) => {
      const { groups, missingIdCount } = upgradeOptionGroups(row.groups, row.id);
      totalGroups += groups.length;
      groups.forEach((g) => {
        totalChoices += g.choices.length;
      });
      totalMissingIds += missingIdCount;

      return {
        id: row.id,
        name: row.name,
        groupCount: groups.length,
        choiceCount: groups.reduce((acc, g) => acc + g.choices.length, 0),
        missingIds: missingIdCount,
        specialRequestEnabled: row.special_request_enabled,
      };
    });

    console.log(`Total produk di database: ${rows.length}`);
    console.log(`Total customization groups: ${totalGroups}`);
    console.log(`Total choices / options: ${totalChoices}`);
    console.log(`Total ID kosong/hilang ditemukan: ${totalMissingIds}`);
    console.table(auditResults);

    return {
      totalProducts: rows.length,
      totalGroups,
      totalChoices,
      totalMissingIds,
      items: auditResults,
    };
  } else {
    // Audit in-memory seed data
    let totalGroups = 0;
    let totalChoices = 0;
    let totalMissingIds = 0;

    const auditResults = seedMenu.map((row) => {
      const { groups, missingIdCount } = upgradeOptionGroups(row.groups, row.id);
      totalGroups += groups.length;
      groups.forEach((g) => {
        totalChoices += g.choices.length;
      });
      totalMissingIds += missingIdCount;

      return {
        id: row.id,
        name: row.name,
        groupCount: groups.length,
        choiceCount: groups.reduce((acc, g) => acc + g.choices.length, 0),
        missingIds: missingIdCount,
      };
    });

    console.log(`Total produk di seedMenu: ${seedMenu.length}`);
    console.log(`Total customization groups: ${totalGroups}`);
    console.log(`Total choices / options: ${totalChoices}`);
    console.log(`Total ID kosong/hilang ditemukan: ${totalMissingIds}`);
    console.table(auditResults);

    return {
      totalProducts: seedMenu.length,
      totalGroups,
      totalChoices,
      totalMissingIds,
      items: auditResults,
    };
  }
}

/**
 * Eksekusi Migrasi Fase 3 dengan Transaksi Database (Atomic Rollback on Error)
 */
export async function migratePhase3(options?: { singleItemId?: string }) {
  console.log("=========================================================================");
  console.log(
    `MEMULAI MIGRASI NON-DESTRUKTIF FASE 3 ${options?.singleItemId ? `(SINGLE TEST ITEM: ${options.singleItemId})` : "(FULL DATABASE)"}`,
  );
  console.log("=========================================================================");

  if (!sql) {
    console.log(
      "DATABASE_URL tidak terdefinisi. Mode in-memory: struktur type sudah diselaraskan.",
    );
    return { ok: true, mode: "in-memory", processedCount: seedMenu.length };
  }

  try {
    await initDb();

    // 1. DDL: Tambah kolom special_request_enabled jika belum ada
    console.log("1. Memeriksa / Menambahkan kolom special_request_enabled (DEFAULT TRUE)...");
    await sql`
      ALTER TABLE menu_items 
      ADD COLUMN IF NOT EXISTS special_request_enabled BOOLEAN NOT NULL DEFAULT TRUE;
    `;

    // 2. DML: Dijalankan di dalam transaksi database tunggal (Atomic)
    const result = await sql.begin(async (tx) => {
      console.log("2. Memulai transaksi database (tx.begin)...");

      const items = options?.singleItemId
        ? await tx`SELECT id, name, groups, special_request_enabled FROM menu_items WHERE id = ${options.singleItemId};`
        : await tx`SELECT id, name, groups, special_request_enabled FROM menu_items;`;

      if (items.length === 0) {
        throw new Error(
          options?.singleItemId
            ? `Produk uji dengan ID '${options.singleItemId}' tidak ditemukan!`
            : "Tabel menu_items kosong.",
        );
      }

      for (const item of items) {
        const { groups: upgradedGroups } = upgradeOptionGroups(item.groups, item.id);

        await tx`
          UPDATE menu_items 
          SET 
            groups = ${tx.json(upgradedGroups)},
            special_request_enabled = COALESCE(special_request_enabled, TRUE)
          WHERE id = ${item.id};
        `;
      }

      console.log(
        `3. Berhasil memperbarui ${items.length} item di dalam transaksi. Melakukan commit...`,
      );
      return { processedCount: items.length };
    });

    console.log("=== TRANSAKSI MIGRASI FASE 3 BERHASIL DI-COMMIT ===");
    return { ok: true, processedCount: result.processedCount };
  } catch (error) {
    console.error("=== MIGRASI GAGAL (TRANSAKSI OTOMATIS DI-ROLLBACK) ===", error);
    throw error;
  }
}
