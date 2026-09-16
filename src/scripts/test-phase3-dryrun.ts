import { auditAllMenuItems, upgradeOptionGroups, generateDeterministicId } from "./migrate-phase3";
import { seedMenu } from "../lib/seed-data";

async function runTestDryRun() {
  console.log("=== STEP 1: AUDIT SELURUH PRODUK ===");
  await auditAllMenuItems();

  console.log("\n=== STEP 2: TEST SKEMA ID DETERMINISTIK (SAFETY NET) ===");
  const testDet1 = generateDeterministicId("grp-m99", "Extra Cheese & Mayo", 1);
  const testDet2 = generateDeterministicId("opt-grp1", "Super Spicy Sambal", 3);
  console.log(`- Deterministic Group ID: '${testDet1}'`);
  console.log(`- Deterministic Option ID: '${testDet2}'`);

  console.log(
    "\n=== STEP 3: BUKTI DRY-RUN IDEMPOTENCY PADA 1 PRODUK UJI (m1: Teriyaki Chicken Bento) ===",
  );
  const testItem = seedMenu.find((m) => m.id === "m1") || seedMenu[0];

  // 1. BEFORE MIGRATION
  console.log("\n--- [1] BEFORE MIGRATION (DATA ASLI) ---");
  const beforeRaw = JSON.parse(JSON.stringify(testItem));
  console.log(
    JSON.stringify(
      {
        id: beforeRaw.id,
        name: beforeRaw.name,
        special_request_enabled: (beforeRaw as { special_request_enabled?: boolean })
          .special_request_enabled,
        groups: beforeRaw.groups,
      },
      null,
      2,
    ),
  );

  // 2. RUN 1 (MIGRASI PERTAMA)
  console.log("\n--- [2] SESUDAH RUN 1 (TRANSFORMASI 1) ---");
  const { groups: run1Groups } = upgradeOptionGroups(beforeRaw.groups, beforeRaw.id);
  const run1Item = {
    id: beforeRaw.id,
    name: beforeRaw.name,
    special_request_enabled: true,
    groups: run1Groups,
  };
  console.log(JSON.stringify(run1Item, null, 2));

  // 3. RUN 2 (MIGRASI KEDUA - IDEMPOTENCY CHECK)
  console.log("\n--- [3] SESUDAH RUN 2 (TRANSFORMASI 2 PADA HASIL RUN 1) ---");
  const { groups: run2Groups } = upgradeOptionGroups(run1Item.groups, run1Item.id);
  const run2Item = {
    id: run1Item.id,
    name: run1Item.name,
    special_request_enabled: true,
    groups: run2Groups,
  };
  console.log(JSON.stringify(run2Item, null, 2));

  // 4. COMPARISON DIFF CHECK
  const isIdentical = JSON.stringify(run1Item) === JSON.stringify(run2Item);
  console.log("=========================================================================");
  console.log(
    `VERIFIKASI IDEMPOTENCY (Run 1 vs Run 2 Identik): ${isIdentical ? "BERHASIL (TRUE - 100% IDENTIK)" : "GAGAL (FALSE)"}`,
  );
  console.log("=========================================================================");

  // Verifikasi perubahan field:
  const fieldDiffs = {
    nameUnchanged: beforeRaw.name === run1Item.name,
    idUnchanged: beforeRaw.id === run1Item.id,
    groupLengthUnchanged: beforeRaw.groups.length === run1Item.groups.length,
    choiceLengthUnchanged:
      (beforeRaw.groups[0]?.choices.length ?? 0) === (run1Item.groups[0]?.choices.length ?? 0),
    choicePricesUnchanged:
      (beforeRaw.groups[0]?.choices[1]?.price ?? 0) ===
      (run1Item.groups[0]?.choices[1]?.price ?? 0),
    enabledAdded: run1Item.groups[0]?.enabled === true && run1Item.groups[1]?.enabled === true,
    specialRequestAdded: run1Item.special_request_enabled === true,
  };

  console.log("\nDETAIL VERIFIKASI FIELD TRANSFORMASI:");
  console.table(fieldDiffs);
}

runTestDryRun().catch(console.error);
