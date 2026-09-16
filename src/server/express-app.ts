import express, { type Request, type Response } from "express";
import cors from "cors";
import { sql, initDb, seedDbIfEmpty } from "../lib/db";
import { seedState } from "../lib/seed-data";

export const expressApp = express();

// Middlewares
expressApp.use(cors());
expressApp.use(express.json());
expressApp.use(express.urlencoded({ extended: true }));

// Health Check with Full Technology Stack Identification
expressApp.get("/api/health", async (_req: Request, res: Response): Promise<void> => {
  let dbStatus = "offline";
  if (sql) {
    try {
      await sql`SELECT 1`;
      dbStatus = "connected";
    } catch {
      dbStatus = "error";
    }
  }

  res.json({
    status: "ok",
    service: "Nanami Kitchen API Server",
    stack: {
      frontend: "React 19 (TypeScript + Tailwind CSS)",
      backend: "ExpressJS",
      database: "PostgreSQL",
    },
    database: {
      driver: "postgres.js",
      status: dbStatus,
      configured: Boolean(process.env["DATABASE_URL"]),
    },
    timestamp: new Date().toISOString(),
  });
});

// Full state sync from PostgreSQL
expressApp.get("/api/state", async (_req: Request, res: Response): Promise<void> => {
  if (!sql) {
    res.json({ state: seedState, source: "in-memory-seed" });
    return;
  }

  try {
    await initDb();
    await seedDbIfEmpty(seedState);

    const [settings, cms, menu, orders, promos, vouchers, accounts, staff, media] =
      await Promise.all([
        sql`SELECT data FROM app_settings WHERE id = 'main_settings' LIMIT 1`,
        sql`SELECT data FROM cms_content WHERE id = 'main_cms' LIMIT 1`,
        sql`SELECT * FROM menu_items ORDER BY id`,
        sql`SELECT * FROM orders ORDER BY created_at DESC`,
        sql`SELECT * FROM promos ORDER BY id`,
        sql`SELECT * FROM vouchers ORDER BY code`,
        sql`SELECT * FROM accounts ORDER BY id`,
        sql`SELECT * FROM staff ORDER BY created_at DESC`,
        sql`SELECT * FROM media_assets ORDER BY uploaded_at DESC`,
      ]);

    res.json({
      source: "postgresql",
      settings: settings[0]?.["data"] ?? seedState.settings,
      cms: cms[0]?.["data"] ?? seedState.cms,
      menu: menu.length ? menu : seedState.menu,
      orders: orders.length ? orders : seedState.orders,
      promos: promos.length ? promos : seedState.promos,
      vouchers: vouchers.length ? vouchers : seedState.vouchers,
      accounts: accounts.length ? accounts : seedState.accounts,
      staff: staff.length ? staff : seedState.staff,
      mediaAssets: media,
    });
  } catch (error) {
    console.error("[Express API] Failed to fetch state from PostgreSQL:", error);
    res.json({ state: seedState, source: "fallback-seed", error: String(error) });
  }
});

// Menu Endpoints
expressApp.get("/api/menu", async (_req: Request, res: Response): Promise<void> => {
  if (!sql) {
    res.json({ menu: seedState.menu || [] });
    return;
  }
  try {
    await initDb();
    const rows = await sql`SELECT * FROM menu_items ORDER BY category, name`;
    if (rows.length === 0 && seedState.menu) {
      res.json({ menu: seedState.menu });
      return;
    }
    res.json({ menu: rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch menu items", details: String(err) });
  }
});

expressApp.get("/api/menu/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ error: "Item ID required" });
    return;
  }
  if (!sql) {
    const item = seedState.menu?.find((m) => m.id === id);
    if (item) {
      res.json({ item });
    } else {
      res.status(404).json({ error: "Item not found" });
    }
    return;
  }
  try {
    const rows = await sql`SELECT * FROM menu_items WHERE id = ${id} LIMIT 1`;
    if (rows.length === 0) {
      res.status(404).json({ error: "Item not found" });
      return;
    }
    res.json({ item: rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve item", details: String(err) });
  }
});

// Orders Endpoints
expressApp.get("/api/orders", async (_req: Request, res: Response): Promise<void> => {
  if (!sql) {
    res.json({ orders: seedState.orders || [] });
    return;
  }
  try {
    await initDb();
    const orders = await sql`SELECT * FROM orders ORDER BY created_at DESC LIMIT 100`;
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders", details: String(err) });
  }
});

expressApp.post("/api/orders", async (req: Request, res: Response): Promise<void> => {
  const order = req.body as Record<string, unknown>;
  if (!order || !order["id"] || !order["lines"]) {
    res.status(400).json({ error: "Invalid order payload" });
    return;
  }

  if (!sql) {
    res.status(201).json({ success: true, order, storage: "in-memory" });
    return;
  }

  try {
    await initDb();
    const orderId = String(order["id"]);
    const orderCode = String(order["code"]);
    const createdAt = Number(order["createdAt"]) || Date.now();
    const orderType = String(order["type"]);
    const lines = JSON.stringify(order["lines"]);
    const subtotal = Number(order["subtotal"]) || 0;
    const discount = Number(order["discount"]) || 0;
    const voucherCode = order["voucherCode"] ? String(order["voucherCode"]) : null;
    const deliveryFee = Number(order["deliveryFee"]) || 0;
    const total = Number(order["total"]) || 0;
    const status = order["status"] ? String(order["status"]) : "Pending Payment";
    const paid = Boolean(order["paid"]);
    const paymentMethod = order["paymentMethod"] ? String(order["paymentMethod"]) : "Bank Transfer";
    const pointsEarned = Number(order["pointsEarned"]) || 0;
    const etaMinutes = Number(order["etaMinutes"]) || 20;
    const customer = JSON.stringify(order["customer"] || {});
    const accountId = order["accountId"] ? String(order["accountId"]) : null;

    await sql`
      INSERT INTO orders (
        id, code, created_at, type, lines, subtotal, discount, voucher_code,
        delivery_fee, total, status, paid, payment_method, points_earned,
        eta_minutes, customer, account_id
      ) VALUES (
        ${orderId}, ${orderCode}, ${createdAt}, ${orderType},
        ${lines}::jsonb, ${subtotal}, ${discount},
        ${voucherCode}, ${deliveryFee}, ${total},
        ${status}, ${paid},
        ${paymentMethod}, ${pointsEarned},
        ${etaMinutes}, ${customer}::jsonb, ${accountId}
      )
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        paid = EXCLUDED.paid,
        eta_minutes = EXCLUDED.eta_minutes
    `;
    res.status(201).json({ success: true, order, storage: "postgresql" });
  } catch (err) {
    console.error("[Express API] Order creation error:", err);
    res.status(500).json({ error: "Failed to save order in PostgreSQL", details: String(err) });
  }
});

// Vouchers Endpoints
expressApp.get("/api/vouchers", async (_req: Request, res: Response): Promise<void> => {
  if (!sql) {
    res.json({ vouchers: seedState.vouchers || [] });
    return;
  }
  try {
    await initDb();
    const vouchers = await sql`SELECT * FROM vouchers WHERE active = true`;
    res.json({ vouchers });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch vouchers", details: String(err) });
  }
});

// CMS Endpoints
expressApp.get("/api/cms", async (_req: Request, res: Response): Promise<void> => {
  if (!sql) {
    res.json({ cms: seedState.cms });
    return;
  }
  try {
    await initDb();
    const rows = await sql`SELECT data FROM cms_content WHERE id = 'main_cms' LIMIT 1`;
    res.json({ cms: rows[0]?.["data"] ?? seedState.cms });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch CMS content", details: String(err) });
  }
});

// Settings Endpoints
expressApp.get("/api/settings", async (_req: Request, res: Response): Promise<void> => {
  if (!sql) {
    res.json({ settings: seedState.settings });
    return;
  }
  try {
    await initDb();
    const rows = await sql`SELECT data FROM app_settings WHERE id = 'main_settings' LIMIT 1`;
    res.json({ settings: rows[0]?.["data"] ?? seedState.settings });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch settings", details: String(err) });
  }
});

// Auth Verification
expressApp.post("/api/auth/login", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const accounts = seedState.accounts || [];
  const found = accounts.find(
    (a) =>
      a.email.trim().toLowerCase() === String(email).trim().toLowerCase() &&
      a.password === password,
  );

  if (!found) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const { password: _, ...safeUser } = found;
  res.json({ success: true, user: safeUser });
});
