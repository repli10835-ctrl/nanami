import { sql, initDb, seedDbIfEmpty } from "../lib/db";
import { seedState } from "../lib/seed-data";

export async function handleApiRequest(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (!pathname.startsWith("/api/")) {
    return null;
  }

  const corsHeaders: Record<string, string> = {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "access-control-allow-headers": "Content-Type, Authorization",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // 1. Health Check
    if (pathname === "/api/health") {
      let dbStatus = "offline (using robust local fallback state)";
      if (sql) {
        try {
          await sql`SELECT 1`;
          dbStatus = "connected";
        } catch {
          dbStatus = "connection_failed";
        }
      }

      return new Response(
        JSON.stringify(
          {
            status: "ok",
            service: "Nanami Kitchen API Server",
            stack: {
              frontend: "React 19 (TypeScript + Tailwind CSS)",
              backend: "ExpressJS & Full-Stack Node Engine",
              database: "PostgreSQL",
            },
            database: {
              driver: "postgres.js",
              status: dbStatus,
              configured: Boolean(process.env["DATABASE_URL"]),
            },
            timestamp: new Date().toISOString(),
          },
          null,
          2,
        ),
        { status: 200, headers: corsHeaders },
      );
    }

    // 2. Full State Sync
    if (pathname === "/api/state") {
      if (!sql) {
        return new Response(JSON.stringify({ state: seedState, source: "in-memory-seed" }), {
          status: 200,
          headers: corsHeaders,
        });
      }
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

      return new Response(
        JSON.stringify({
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
        }),
        { status: 200, headers: corsHeaders },
      );
    }

    // 3. Menu Items
    if (pathname === "/api/menu") {
      if (!sql) {
        return new Response(JSON.stringify({ menu: seedState.menu || [] }), {
          status: 200,
          headers: corsHeaders,
        });
      }
      await initDb();
      const rows = await sql`SELECT * FROM menu_items ORDER BY category, name`;
      return new Response(JSON.stringify({ menu: rows.length ? rows : seedState.menu }), {
        status: 200,
        headers: corsHeaders,
      });
    }

    // 4. Single Menu Item
    if (pathname.startsWith("/api/menu/")) {
      const id = pathname.replace("/api/menu/", "");
      if (!sql) {
        const item = seedState.menu?.find((m) => m.id === id);
        return item
          ? new Response(JSON.stringify({ item }), { status: 200, headers: corsHeaders })
          : new Response(JSON.stringify({ error: "Item not found" }), {
              status: 404,
              headers: corsHeaders,
            });
      }
      await initDb();
      const rows = await sql`SELECT * FROM menu_items WHERE id = ${id} LIMIT 1`;
      return rows.length
        ? new Response(JSON.stringify({ item: rows[0] }), { status: 200, headers: corsHeaders })
        : new Response(JSON.stringify({ error: "Item not found" }), {
            status: 404,
            headers: corsHeaders,
          });
    }

    // 5. Orders List & Creation
    if (pathname === "/api/orders") {
      if (request.method === "GET") {
        if (!sql) {
          return new Response(JSON.stringify({ orders: seedState.orders || [] }), {
            status: 200,
            headers: corsHeaders,
          });
        }
        await initDb();
        const rows = await sql`SELECT * FROM orders ORDER BY created_at DESC LIMIT 100`;
        return new Response(JSON.stringify({ orders: rows }), {
          status: 200,
          headers: corsHeaders,
        });
      }

      if (request.method === "POST") {
        const order = (await request.json()) as Record<string, unknown>;
        if (!order || !order["id"] || !order["lines"]) {
          return new Response(JSON.stringify({ error: "Invalid order data" }), {
            status: 400,
            headers: corsHeaders,
          });
        }
        if (!sql) {
          return new Response(JSON.stringify({ success: true, order, storage: "in-memory" }), {
            status: 201,
            headers: corsHeaders,
          });
        }
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
        const paymentMethod = order["paymentMethod"]
          ? String(order["paymentMethod"])
          : "Bank Transfer";
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
        return new Response(JSON.stringify({ success: true, order, storage: "postgresql" }), {
          status: 201,
          headers: corsHeaders,
        });
      }
    }

    // 6. Vouchers
    if (pathname === "/api/vouchers") {
      if (!sql) {
        return new Response(JSON.stringify({ vouchers: seedState.vouchers || [] }), {
          status: 200,
          headers: corsHeaders,
        });
      }
      await initDb();
      const rows = await sql`SELECT * FROM vouchers WHERE active = true`;
      return new Response(JSON.stringify({ vouchers: rows }), {
        status: 200,
        headers: corsHeaders,
      });
    }

    // 7. CMS
    if (pathname === "/api/cms") {
      if (!sql) {
        return new Response(JSON.stringify({ cms: seedState.cms }), {
          status: 200,
          headers: corsHeaders,
        });
      }
      await initDb();
      const rows = await sql`SELECT data FROM cms_content WHERE id = 'main_cms' LIMIT 1`;
      return new Response(JSON.stringify({ cms: rows[0]?.["data"] ?? seedState.cms }), {
        status: 200,
        headers: corsHeaders,
      });
    }

    // 8. Settings
    if (pathname === "/api/settings") {
      if (!sql) {
        return new Response(JSON.stringify({ settings: seedState.settings }), {
          status: 200,
          headers: corsHeaders,
        });
      }
      await initDb();
      const rows = await sql`SELECT data FROM app_settings WHERE id = 'main_settings' LIMIT 1`;
      return new Response(JSON.stringify({ settings: rows[0]?.["data"] ?? seedState.settings }), {
        status: 200,
        headers: corsHeaders,
      });
    }

    // 9. Auth Check
    if (pathname === "/api/auth/login" && request.method === "POST") {
      const body = (await request.json()) as { email?: string; password?: string };
      const email = body["email"];
      const password = body["password"];
      const accounts = seedState.accounts || [];
      const found = accounts.find(
        (a) =>
          a.email.trim().toLowerCase() === String(email).trim().toLowerCase() &&
          a.password === password,
      );
      if (!found) {
        return new Response(JSON.stringify({ error: "Invalid email or password" }), {
          status: 401,
          headers: corsHeaders,
        });
      }
      const { password: _, ...safeUser } = found;
      return new Response(JSON.stringify({ success: true, user: safeUser }), {
        status: 200,
        headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({ error: "API route not found", path: pathname }), {
      status: 404,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("[API Handler] Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: String(error) }),
      { status: 500, headers: corsHeaders },
    );
  }
}
