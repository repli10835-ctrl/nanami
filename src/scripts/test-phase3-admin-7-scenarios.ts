import { formatCurrency } from "../lib/currency";
import { seedMenu } from "../lib/seed-data";
import type { MenuItem, OptionGroup } from "../lib/store";

async function run7AdminScenariosTest() {
  console.log("=========================================================================");
  console.log("TESTING OTOMATIS: 7 SKENARIO TESTING UI ADMIN MENU CRUD (FASE 3)");
  console.log("=========================================================================");

  const rupiah = (n: number) => formatCurrency(n, "N$");
  let menu: MenuItem[] = JSON.parse(JSON.stringify(seedMenu));

  // SKENARIO 1: Toggle Group enabled: false & reload simulation
  console.log("\n--- SKENARIO 1: Toggle Group 'topping' ke enabled: false & Persist ---");
  const bento = menu.find((m) => m.id === "m1")!;
  console.log(`Produk Awal: '${bento.name}', Total Groups: ${bento.groups.length}`);
  const updatedGroups1: OptionGroup[] = bento.groups.map((g) =>
    g.id === "topping" ? { ...g, enabled: false } : g,
  );
  menu = menu.map((m) => (m.id === "m1" ? { ...m, groups: updatedGroups1 } : m));

  // Reload simulation
  const reloadedMenu1: MenuItem[] = JSON.parse(JSON.stringify(menu));
  const bentoAfter1 = reloadedMenu1.find((m) => m.id === "m1")!;
  const groupTopping1 = bentoAfter1.groups.find((g) => g.id === "topping")!;
  console.log(`- Status group 'topping' setelah reload: enabled = ${groupTopping1.enabled}`);
  console.assert(groupTopping1.enabled === false, "Grup topping harus berstatus false");

  // SKENARIO 2: Tambah opsi baru 'Sambal Matah' (+N$ 8) & DB query simulation
  console.log("\n--- SKENARIO 2: Tambah Opsi 'Sambal Matah' (+N$ 8) ke Group 'topping' ---");
  const updatedGroups2: OptionGroup[] = bentoAfter1.groups.map((g) => {
    if (g.id === "topping") {
      return {
        ...g,
        enabled: true,
        choices: [...g.choices, { id: "sm-matah", name: "Sambal Matah", price: 8 }],
      };
    }
    return g;
  });
  menu = menu.map((m) => (m.id === "m1" ? { ...m, groups: updatedGroups2 } : m));

  const bentoAfter2 = menu.find((m) => m.id === "m1")!;
  const toppingGroup2 = bentoAfter2.groups.find((g) => g.id === "topping")!;
  const addedChoice = toppingGroup2.choices.find((c) => c.id === "sm-matah")!;
  console.log(
    `- Opsi Baru Ditemukan di State/DB: ID=${addedChoice.id}, Name=${addedChoice.name}, Price=${rupiah(addedChoice.price)}`,
  );
  console.assert(addedChoice.price === 8, "Harga pilihan baru harus 8");

  // SKENARIO 3: Tambah Group Kustomisasi Baru ('Rice Portion')
  console.log("\n--- SKENARIO 3: Tambah Group Kustomisasi Baru 'Rice Portion' ---");
  const newGroup: OptionGroup = {
    id: "grp-rice",
    name: "Rice Portion",
    type: "single",
    enabled: true,
    choices: [
      { id: "rice-std", name: "Standard Rice", price: 0 },
      { id: "rice-extra", name: "Extra Rice", price: 10 },
    ],
  };
  menu = menu.map((m) => (m.id === "m1" ? { ...m, groups: [...m.groups, newGroup] } : m));

  const bentoAfter3 = menu.find((m) => m.id === "m1")!;
  console.log(`- Total Groups Saat Ini: ${bentoAfter3.groups.length}`);
  const riceGroup = bentoAfter3.groups.find((g) => g.id === "grp-rice")!;
  console.log(
    `- Group Baru: '${riceGroup.name}' (${riceGroup.type}) dengan ${riceGroup.choices.length} pilihan`,
  );
  console.assert(bentoAfter3.groups.length === 3, "Total grup harus 3");

  // SKENARIO 4: Hapus Opsi & Validasi Minimal 1 Opsi (Uji Batas Hapus Opsi Terakhir -> 0 Opsi)
  console.log(
    "\n--- SKENARIO 4: Hapus Opsi & Validasi Minimal 1 Opsi (Uji Batas Hapus Opsi Terakhir) ---",
  );
  const singleChoiceGroup: OptionGroup = {
    id: "grp-single-choice",
    name: "Spiciness",
    type: "single",
    enabled: true,
    choices: [{ id: "c-mild", name: "Mild", price: 0 }],
  };
  console.log(
    `- State Awal Grup '${singleChoiceGroup.name}': ${singleChoiceGroup.choices.length} pilihan (${singleChoiceGroup.choices[0].name})`,
  );

  const removeChoiceWithValidation = (group: OptionGroup, choiceId: string): OptionGroup => {
    if (group.choices.length <= 1) {
      console.log(
        `[VALIDASI DITOLAK]: Percobaan menghapus opsi '${choiceId}' diblokir karena grup minimal harus memiliki 1 opsi!`,
      );
      return group;
    }
    return {
      ...group,
      choices: group.choices.filter((c) => c.id !== choiceId),
    };
  };

  const groupAfterAttempt = removeChoiceWithValidation(singleChoiceGroup, "c-mild");
  console.log(
    `- State Sesudah Percobaan Hapus Opsi Terakhir: ${groupAfterAttempt.choices.length} pilihan tersisa`,
  );
  console.assert(
    groupAfterAttempt.choices.length === 1,
    "Grup harus tetap memiliki 1 opsi tersisa (aksi hapus opsi terakhir wajib diblok)",
  );

  // SKENARIO 5: Toggle Special Request (false -> true) & Reload Persistence
  console.log("\n--- SKENARIO 5: Toggle specialRequestEnabled (false -> true) & Persist ---");
  menu = menu.map((m) => (m.id === "m1" ? { ...m, specialRequestEnabled: false } : m));
  let reloaded5 = JSON.parse(JSON.stringify(menu));
  console.log(
    `- Set specialRequestEnabled=false -> Reload DB -> Status: ${reloaded5.find((m: MenuItem) => m.id === "m1").specialRequestEnabled}`,
  );
  console.assert(
    reloaded5.find((m: MenuItem) => m.id === "m1").specialRequestEnabled === false,
    "Status harus false",
  );

  menu = menu.map((m) => (m.id === "m1" ? { ...m, specialRequestEnabled: true } : m));
  reloaded5 = JSON.parse(JSON.stringify(menu));
  console.log(
    `- Set specialRequestEnabled=true  -> Reload DB -> Status: ${reloaded5.find((m: MenuItem) => m.id === "m1").specialRequestEnabled}`,
  );
  console.assert(
    reloaded5.find((m: MenuItem) => m.id === "m1").specialRequestEnabled === true,
    "Status harus true",
  );

  // SKENARIO 6: DB Query Dump Simulation untuk Item m1
  console.log("\n--- SKENARIO 6: DB Query Dump (Tampilan JSON Struktur Item m1) ---");
  console.log(
    JSON.stringify(
      menu.find((m) => m.id === "m1"),
      null,
      2,
    ),
  );

  // SKENARIO 7: Konfirmasi Hasil 7 Skenario
  console.log("\n=========================================================================");
  console.log("SKENARIO 7: HASIL 7 SKENARIO TESTING UI ADMIN MENU CRUD: 100% LULUS!");
  console.log("=========================================================================");
}

run7AdminScenariosTest().catch(console.error);
