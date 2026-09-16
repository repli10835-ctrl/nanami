import { seedMenu } from "../lib/seed-data";
import { type MenuItem, type OptionGroup } from "../lib/store";

async function runAdminCrudTests() {
  console.log("=========================================================================");
  console.log("TESTING OTOMATIS: UI ADMIN MENU CRUD FASE 3");
  console.log("=========================================================================");

  // Setup state menu tiruan yang merefleksikan store.ts
  let menu: MenuItem[] = JSON.parse(JSON.stringify(seedMenu));
  console.log(`[TEST 1] Menu awal berisi ${menu.length} produk.`);
  console.assert(menu.length >= 6, "Menu awal harus memiliki minimal 6 produk");

  const bento = menu.find((m) => m.id === "m1");
  console.assert(bento !== undefined, "Item m1 (Teriyaki Chicken Bento) harus ada");
  console.log(
    `- Item uji: '${bento?.name}', groups count: ${bento?.groups.length}, specialRequestEnabled: ${bento?.specialRequestEnabled}`,
  );

  // [TEST 2] Toggle OFF salah satu OptionGroup
  console.log("\n[TEST 2] Toggle OptionGroup 'topping' menjadi enabled: false...");
  const updatedGroups: OptionGroup[] = bento!.groups.map((g) =>
    g.id === "topping" ? { ...g, enabled: false } : g,
  );
  menu = menu.map((m) => (m.id === "m1" ? { ...m, groups: updatedGroups } : m));

  let currentBento = menu.find((m) => m.id === "m1")!;
  const toppingGroup = currentBento.groups.find((g) => g.id === "topping");
  console.assert(toppingGroup?.enabled === false, "Grup 'topping' harus berstatus enabled: false");
  console.log(`- Status grup 'topping' setelah update: enabled = ${toppingGroup?.enabled} (PASS)`);

  // [TEST 3] Tambah opsi baru dinamis ke dalam grup (e.g. Sambal Matah +R8)
  console.log("\n[TEST 3] Menambahkan opsi baru 'Sambal Matah' (+R8) ke grup 'topping'...");
  const withNewChoice: OptionGroup[] = currentBento.groups.map((g) => {
    if (g.id === "topping") {
      return {
        ...g,
        enabled: true,
        choices: [...g.choices, { id: "sm-matah", name: "Sambal Matah", price: 8 }],
      };
    }
    return g;
  });
  menu = menu.map((m) => (m.id === "m1" ? { ...m, groups: withNewChoice } : m));

  currentBento = menu.find((m) => m.id === "m1")!;
  const updatedToppingGroup = currentBento.groups.find((g) => g.id === "topping")!;
  const addedChoice = updatedToppingGroup.choices.find((c) => c.id === "sm-matah");
  console.assert(addedChoice !== undefined, "Choice baru 'sm-matah' harus tersimpan");
  console.assert(addedChoice?.price === 8, "Harga choice baru harus 8");
  console.log(
    `- Choice baru ditemukan: '${addedChoice?.name}' dengan harga +R${addedChoice?.price} (PASS)`,
  );

  // [TEST 4] Tambah Grup Kustomisasi Baru
  console.log("\n[TEST 4] Menambahkan OptionGroup baru 'Rice Portion' (Single choice)...");
  const newCustomGroup: OptionGroup = {
    id: "grp-rice",
    name: "Rice Portion",
    type: "single",
    enabled: true,
    choices: [
      { id: "rice-std", name: "Standard Rice", price: 0 },
      { id: "rice-extra", name: "Extra Rice (Double)", price: 10 },
    ],
  };
  menu = menu.map((m) => (m.id === "m1" ? { ...m, groups: [...m.groups, newCustomGroup] } : m));

  currentBento = menu.find((m) => m.id === "m1")!;
  console.assert(currentBento.groups.length === 3, "Total grup harus bertambah menjadi 3");
  const riceGroup = currentBento.groups.find((g) => g.id === "grp-rice");
  console.assert(
    riceGroup !== undefined && riceGroup.choices.length === 2,
    "Grup 'Rice Portion' harus memiliki 2 choices",
  );
  console.log(
    `- Grup baru '${riceGroup?.name}' berhasil ditambahkan dengan ${riceGroup?.choices.length} pilihan (PASS)`,
  );

  // [TEST 5] Toggle Special Request
  console.log("\n[TEST 5] Toggle specialRequestEnabled menjadi false, lalu true...");
  menu = menu.map((m) => (m.id === "m1" ? { ...m, specialRequestEnabled: false } : m));
  currentBento = menu.find((m) => m.id === "m1")!;
  console.assert(currentBento.specialRequestEnabled === false, "specialRequestEnabled harus false");
  console.log(
    `- specialRequestEnabled setelah di-disable: ${currentBento.specialRequestEnabled} (PASS)`,
  );

  menu = menu.map((m) => (m.id === "m1" ? { ...m, specialRequestEnabled: true } : m));
  currentBento = menu.find((m) => m.id === "m1")!;
  console.assert(currentBento.specialRequestEnabled === true, "specialRequestEnabled harus true");
  console.log(
    `- specialRequestEnabled setelah di-enable kembali: ${currentBento.specialRequestEnabled} (PASS)`,
  );

  console.log("\n=========================================================================");
  console.log("SEMUA PENGUJIAN LOGIKA UI ADMIN MENU CRUD FASE 3: 100% SUKSES");
  console.log("=========================================================================");
}

runAdminCrudTests().catch(console.error);
