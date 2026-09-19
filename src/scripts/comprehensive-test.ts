import { handleApiRequest } from "../server/api-handler";
import { getStorageData } from "../server/persistent-storage";

async function runAllTests() {
  console.log("=== STARTING COMPREHENSIVE APPLICATION TEST ===");
  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`❌ [FAIL] ${name}:`, err.message || err);
      failed++;
    }
  }

  // Test 1: Health Endpoint
  await test("GET /api/health", async () => {
    const req = new Request("http://localhost:3000/api/health", { method: "GET" });
    const res = await handleApiRequest(req);
    if (!res || res.status !== 200) throw new Error(`Expected 200, got ${res?.status}`);
    const data = await res.json();
    if (data.status !== "ok") throw new Error("Status was not ok");
  });

  // Test 2: State Endpoint
  await test("GET /api/state", async () => {
    const req = new Request("http://localhost:3000/api/state", { method: "GET" });
    const res = await handleApiRequest(req);
    if (!res || res.status !== 200) throw new Error(`Expected 200, got ${res?.status}`);
    const data = await res.json();
    if (!data.settings || !data.cms || !Array.isArray(data.menu)) {
      throw new Error("Invalid state payload");
    }
  });

  // Test 3: Menu CRUD Operations
  await test("Menu Items CRUD & Persistence", async () => {
    const testItem = {
      id: "test-menu-item-99",
      name: "Super Bento Test",
      description: "Delicious test bento",
      price: 45000,
      category: "Bento Set",
      available: true,
      prepMinutes: 12,
      badges: ["Chef Special"],
      stock: 50,
      groups: [],
      specialRequestEnabled: true,
    };

    // 1. Create/Update
    const postReq = new Request("http://localhost:3000/api/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testItem),
    });
    const postRes = await handleApiRequest(postReq);
    if (!postRes || postRes.status !== 200) throw new Error("Failed to post menu item");

    // 2. Fetch Single
    const getSingleReq = new Request(`http://localhost:3000/api/menu/${testItem.id}`, {
      method: "GET",
    });
    const getSingleRes = await handleApiRequest(getSingleReq);
    if (!getSingleRes || getSingleRes.status !== 200) throw new Error("Failed to fetch menu item");
    const singleData = await getSingleRes.json();
    if (singleData.item?.name !== testItem.name) throw new Error("Menu item name mismatch");

    // 3. Delete
    const delReq = new Request(`http://localhost:3000/api/menu/${testItem.id}`, {
      method: "DELETE",
    });
    const delRes = await handleApiRequest(delReq);
    if (!delRes || delRes.status !== 200) throw new Error("Failed to delete menu item");
  });

  // Test 4: Orders CRUD
  await test("Orders Endpoint Creation & Retrieval", async () => {
    const testOrder = {
      id: "test-order-99",
      code: "ORD-TEST-99",
      createdAt: new Date().toISOString(),
      type: "delivery",
      lines: [{ id: "l1", name: "Bento", price: 45000, qty: 1 }],
      subtotal: 45000,
      discount: 0,
      voucherCode: "",
      deliveryFee: 10000,
      total: 55000,
      status: "pending",
      paid: false,
      paymentMethod: "qris",
      pointsEarned: 55,
      etaMinutes: 30,
      customer: { name: "Test Customer", phone: "08123456789" },
    };

    const postReq = new Request("http://localhost:3000/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testOrder),
    });
    const postRes = await handleApiRequest(postReq);
    if (!postRes || postRes.status !== 201) throw new Error("Failed to create order");

    const patchReq = new Request(`http://localhost:3000/api/orders/${testOrder.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "confirmed", paid: true }),
    });
    const patchRes = await handleApiRequest(patchReq);
    if (!patchRes || patchRes.status !== 200) throw new Error("Failed to update order");
  });

  // Test 5: Vouchers & Promos
  await test("Vouchers & Promos Endpoints", async () => {
    const testVoucher = {
      code: "TEST50",
      type: "percent",
      value: 50,
      minSpend: 50000,
      active: true,
    };

    const postVReq = new Request("http://localhost:3000/api/vouchers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testVoucher),
    });
    const postVRes = await handleApiRequest(postVReq);
    if (!postVRes || postVRes.status !== 200) throw new Error("Failed to create voucher");

    const testPromo = {
      id: "promo-test-99",
      title: "Test Promo Title",
      subtitle: "Test Subtitle",
      badge: "Deal",
      active: true,
    };
    const postPReq = new Request("http://localhost:3000/api/promos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testPromo),
    });
    const postPRes = await handleApiRequest(postPReq);
    if (!postPRes || postPRes.status !== 200) throw new Error("Failed to create promo");
  });

  // Test 6: CMS & Settings Persistence
  await test("CMS & App Settings Persistence", async () => {
    const currStorage = getStorageData();
    const updatedSettings = {
      ...currStorage.settings,
      storeName: "Nanami Kitchen & Sushi Bar",
    };

    const postSetReq = new Request("http://localhost:3000/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedSettings),
    });
    const postSetRes = await handleApiRequest(postSetReq);
    if (!postSetRes || postSetRes.status !== 200) throw new Error("Failed to save settings");

    const getSetReq = new Request("http://localhost:3000/api/settings", { method: "GET" });
    const getSetRes = await handleApiRequest(getSetReq);
    const loaded = await getSetRes?.json();
    if (loaded?.settings?.storeName !== "Nanami Kitchen & Sushi Bar") {
      throw new Error("Settings not preserved correctly");
    }
  });

  // Test 7: Staff Management
  await test("Staff Management Endpoint", async () => {
    const newStaff = {
      id: "staff-test-01",
      name: "Chef Tanaka",
      email: "tanaka@nanami.id",
      phone: "0812999888",
      role: "staff",
      active: true,
      createdAt: Date.now(),
    };
    const postStaffReq = new Request("http://localhost:3000/api/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newStaff),
    });
    const postStaffRes = await handleApiRequest(postStaffReq);
    if (!postStaffRes || postStaffRes.status !== 200) throw new Error("Failed to create staff");

    const getStaffReq = new Request("http://localhost:3000/api/staff", { method: "GET" });
    const getStaffRes = await handleApiRequest(getStaffReq);
    const staffList = await getStaffRes?.json();
    if (
      !Array.isArray(staffList?.staff) ||
      !staffList.staff.some((s: any) => s.email === "tanaka@nanami.id")
    ) {
      throw new Error("Staff member not found in list");
    }
  });

  // Test 8: Authentication Endpoints
  await test("Auth Login Endpoint", async () => {
    const loginReq = new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "owner@nanamikitchen.com", password: "owner123" }),
    });
    const loginRes = await handleApiRequest(loginReq);
    if (!loginRes || loginRes.status !== 200) throw new Error("Failed login request");
    const loginData = await loginRes.json();
    if (!loginData.ok || !loginData.account) throw new Error("Owner login failed");
  });

  console.log(`\n=== RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
