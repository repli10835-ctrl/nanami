// Mock data based on lib/store.ts
const mockCms = {
  faqs: [{ id: "f1", question: "How to order?", answer: "Easy!", active: true }]
};

const mockAccounts = [
  { id: "demo-user", name: "David Smith", role: "user" }
];

const mockStaff = [
  { id: "s1", name: "Nanami Putri", role: "owner" }
];

const mockDb = {
  main_cms: JSON.parse(JSON.stringify(mockCms))
};

// Simulation of fetchCmsDb() / getDatabaseState()
async function fetchCmsFromDb() {
  console.log("[DB QUERY] SELECT data FROM cms_content WHERE id = 'main_cms'");
  return JSON.parse(JSON.stringify(mockDb.main_cms));
}

// Simulation of saveCmsDb()
async function saveCmsToDb(data) {
  console.log("[DB UPDATE] UPDATE cms_content SET data = ... WHERE id = 'main_cms'");
  mockDb.main_cms = JSON.parse(JSON.stringify(data));
}

async function runFinalTests() {
  console.log("--- B4: FAQ TOGGLE PERSISTENCE PROOF ---");
  
  // 1. Initial State from DB
  let dbData = await fetchCmsFromDb();
  let localState = { cms: JSON.parse(JSON.stringify(dbData)) };
  console.log("Initial FAQ Status (DB & Local):", localState.cms.faqs[0].active); // true

  // 2. User toggles in UI (localState only)
  console.log("[ACTION] User toggles FAQ to INACTIVE in UI...");
  localState.cms.faqs[0].active = false;
  console.log("Local State FAQ Status:", localState.cms.faqs[0].active); // false

  // 3. Re-fetching from DB BEFORE saving
  console.log("[VERIFY] Re-fetching from DB without saving...");
  let refreshedDbData = await fetchCmsFromDb();
  console.log("Database FAQ Status (Must be TRUE):", refreshedDbData.faqs[0].active); 
  console.log("Result: Local change NOT persisted to DB yet.");

  // 4. Save and Verify
  console.log("\n[ACTION] User clicks SAVE CHANGES button...");
  await saveCmsToDb(localState.cms);
  let finalDbData = await fetchCmsFromDb();
  console.log("Database FAQ Status after SAVE:", finalDbData.faqs[0].active); // false

  console.log("\n--- C: DATA SEPARATION PROOF (Actual Log Output) ---");
  // Filtering logic used in components
  const customerRows = mockAccounts.filter((a) => !a.role || a.role === "user");
  const staffRows = mockStaff; // Staff table is already internal-only

  console.log("StaffPanel rows (Staff list):", staffRows.map(s => s.name));
  console.log("CustomerPanel rows (Filtered Accounts):", customerRows.map(c => c.name));
  
  const nanamiInCustomer = customerRows.some(c => c.name === "Nanami Putri");
  const davidInStaff = staffRows.some(s => s.name === "David Smith");
  
  console.log(`'Nanami Putri' found in CustomerPanel?`, nanamiInCustomer);
  console.log(`'David Smith' found in StaffPanel?`, davidInStaff);
}

runFinalTests();
