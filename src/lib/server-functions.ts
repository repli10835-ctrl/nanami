import { createServerFn } from "@tanstack/react-start";
import { sql, initDb, seedDbIfEmpty } from "./db";
import {
  type MenuItem,
  type Order,
  type Voucher,
  type Promo,
  type Account,
  type StaffMember,
  type Settings,
  type CmsContent,
  type MediaAsset,
} from "./store";

export const getDatabaseState = createServerFn({ method: "GET" }).handler(async () => {
  if (!sql) return null;
  try {
    const ok = await initDb();
    if (!ok) {
      return null;
    }

    // Seed default if database is freshly created and has no records
    const { seedState } = await import("./seed-data");
    await seedDbIfEmpty(seedState);

    const settings = await sql`SELECT data FROM app_settings WHERE id = 'main_settings' LIMIT 1`;
    const cms = await sql`SELECT data FROM cms_content WHERE id = 'main_cms' LIMIT 1`;
    const menu = await sql`SELECT * FROM menu_items ORDER BY id`;
    const orders = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
    const promos = await sql`SELECT * FROM promos ORDER BY id`;
    const vouchers = await sql`SELECT * FROM vouchers ORDER BY code`;
    const accounts = await sql`SELECT * FROM accounts ORDER BY id`;
    const staff = await sql`SELECT * FROM staff ORDER BY created_at DESC`;
    const media = await sql`SELECT * FROM media_assets ORDER BY uploaded_at DESC`;

    return {
      settings: settings[0]?.data,
      cms: cms[0]?.data,
      menu: menu.map((m) => ({
        id: m.id,
        name: m.name,
        description: m.description,
        price: Number(m.price),
        category: m.category,
        image: m.image,
        available: m.available,
        prepMinutes: m.prep_minutes,
        badges: m.badges,
        stock: m.stock,
        groups: m.groups,
        specialRequestEnabled:
          m.special_request_enabled !== undefined ? Boolean(m.special_request_enabled) : true,
      })),
      orders: orders.map((o) => ({
        id: o.id,
        code: o.code,
        createdAt: Number(o.created_at),
        type: o.type,
        lines: o.lines,
        subtotal: Number(o.subtotal),
        discount: Number(o.discount),
        voucherCode: o.voucher_code,
        deliveryFee: Number(o.delivery_fee),
        total: Number(o.total),
        status: o.status,
        paid: o.paid,
        paymentMethod: o.payment_method,
        pointsEarned: o.points_earned,
        etaMinutes: o.eta_minutes,
        customer: o.customer,
        accountId: o.account_id || null,
      })),
      promos: promos.map((p) => ({
        id: p.id,
        title: p.title,
        subtitle: p.subtitle,
        badge: p.badge,
        imageUrl: p.image_url,
        link: p.link,
        active: p.active,
      })),
      vouchers: vouchers.map((v) => ({
        code: v.code,
        type: v.type,
        value: Number(v.value),
        minSpend: Number(v.min_spend),
        active: v.active,
      })),
      accounts: accounts.map((a) => ({
        id: a.id,
        email: a.email,
        password: a.password,
        name: a.name,
        phone: a.phone,
        role: a.role,
        address: a.address,
        addresses: a.addresses,
        points: a.points,
      })),
      staff: staff.map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        phone: s.phone,
        role: s.role,
        active: s.active,
        createdAt: Number(s.created_at),
      })),
      mediaAssets: media.map((m) => ({
        id: m.id,
        url: m.url,
        filename: m.filename,
        uploadedAt: Number(m.uploaded_at),
        usedByMenuIds: m.used_by_menu_ids || [],
      })),
    };
  } catch (error) {
    console.error("Error fetching state from PostgreSQL database:", error);
    return null;
  }
});

export const saveMenuItemDb = createServerFn({ method: "POST" })
  .validator((item: MenuItem) => item)
  .handler(async ({ data: item }) => {
    if (!sql) return;
    try {
      await sql`
        INSERT INTO menu_items (id, name, description, price, category, image, available, prep_minutes, badges, stock, groups, special_request_enabled)
        VALUES (
          ${item.id}, 
          ${item.name}, 
          ${item.description}, 
          ${item.price}, 
          ${item.category}, 
          ${item.image}, 
          ${item.available}, 
          ${item.prepMinutes}, 
          ${sql.json(item.badges)}, 
          ${item.stock ?? null}, 
          ${sql.json(item.groups)},
          ${item.specialRequestEnabled !== undefined ? item.specialRequestEnabled : true}
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          price = EXCLUDED.price,
          category = EXCLUDED.category,
          image = EXCLUDED.image,
          available = EXCLUDED.available,
          prep_minutes = EXCLUDED.prep_minutes,
          badges = EXCLUDED.badges,
          stock = EXCLUDED.stock,
          groups = EXCLUDED.groups,
          special_request_enabled = EXCLUDED.special_request_enabled
      `;
    } catch (e) {
      console.error("Failed to save menu item to database:", e);
    }
  });

export const deleteMenuItemDb = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    if (!sql) return;
    try {
      await sql`DELETE FROM menu_items WHERE id = ${id}`;
    } catch (e) {
      console.error("Failed to delete menu item from database:", e);
    }
  });

export const saveOrderDb = createServerFn({ method: "POST" })
  .validator((order: Order) => order)
  .handler(async ({ data: order }) => {
    if (!sql) return;
    try {
      await sql`
        INSERT INTO orders (id, code, created_at, type, lines, subtotal, discount, voucher_code, delivery_fee, total, status, paid, payment_method, points_earned, eta_minutes, customer, account_id)
        VALUES (
          ${order.id}, 
          ${order.code}, 
          ${order.createdAt}, 
          ${order.type}, 
          ${sql.json(order.lines)}, 
          ${order.subtotal}, 
          ${order.discount}, 
          ${order.voucherCode || null}, 
          ${order.deliveryFee}, 
          ${order.total}, 
          ${order.status}, 
          ${order.paid}, 
          ${order.paymentMethod}, 
          ${order.pointsEarned}, 
          ${order.etaMinutes}, 
          ${sql.json(order.customer)},
          ${order.accountId || null}
        )
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          paid = EXCLUDED.paid,
          eta_minutes = EXCLUDED.eta_minutes
      `;
    } catch (e) {
      console.error("Failed to save order to database:", e);
    }
  });

export const saveVoucherDb = createServerFn({ method: "POST" })
  .validator((v: Voucher) => v)
  .handler(async ({ data: v }) => {
    if (!sql) return;
    try {
      await sql`
        INSERT INTO vouchers (code, type, value, min_spend, active)
        VALUES (${v.code}, ${v.type}, ${v.value}, ${v.minSpend}, ${v.active})
        ON CONFLICT (code) DO UPDATE SET
          type = EXCLUDED.type,
          value = EXCLUDED.value,
          min_spend = EXCLUDED.min_spend,
          active = EXCLUDED.active
      `;
    } catch (e) {
      console.error("Failed to save voucher to database:", e);
    }
  });

export const deleteVoucherDb = createServerFn({ method: "POST" })
  .validator((code: string) => code)
  .handler(async ({ data: code }) => {
    if (!sql) return;
    try {
      await sql`DELETE FROM vouchers WHERE code = ${code}`;
    } catch (e) {
      console.error("Failed to delete voucher from database:", e);
    }
  });

export const savePromoDb = createServerFn({ method: "POST" })
  .validator((p: Promo) => p)
  .handler(async ({ data: p }) => {
    if (!sql) return;
    try {
      await sql`
        INSERT INTO promos (id, title, subtitle, badge, image_url, link, active)
        VALUES (${p.id}, ${p.title}, ${p.subtitle}, ${p.badge}, ${p.imageUrl || null}, ${p.link || null}, ${p.active ?? true})
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          subtitle = EXCLUDED.subtitle,
          badge = EXCLUDED.badge,
          image_url = EXCLUDED.image_url,
          link = EXCLUDED.link,
          active = EXCLUDED.active
      `;
    } catch (e) {
      console.error("Failed to save promo to database:", e);
    }
  });

export const deletePromoDb = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    if (!sql) return;
    try {
      await sql`DELETE FROM promos WHERE id = ${id}`;
    } catch (e) {
      console.error("Failed to delete promo from database:", e);
    }
  });

export const saveAccountDb = createServerFn({ method: "POST" })
  .validator((acc: Account) => acc)
  .handler(async ({ data: acc }) => {
    if (!sql) return;
    try {
      await sql`
        INSERT INTO accounts (id, email, password, name, phone, role, address, addresses, points)
        VALUES (${acc.id}, ${acc.email}, ${acc.password}, ${acc.name}, ${acc.phone}, ${acc.role || "user"}, ${acc.address || null}, ${sql.json(acc.addresses || [])}, ${acc.points || 0})
        ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          password = EXCLUDED.password,
          name = EXCLUDED.name,
          phone = EXCLUDED.phone,
          role = EXCLUDED.role,
          address = EXCLUDED.address,
          addresses = EXCLUDED.addresses,
          points = EXCLUDED.points
      `;
    } catch (e) {
      console.error("Failed to save account to database:", e);
    }
  });

export const saveStaffDb = createServerFn({ method: "POST" })
  .validator((s: StaffMember) => s)
  .handler(async ({ data: s }) => {
    if (!sql) return;
    try {
      await sql`
        INSERT INTO staff (id, name, email, phone, role, active, created_at)
        VALUES (${s.id}, ${s.name}, ${s.email}, ${s.phone}, ${s.role}, ${s.active}, ${s.createdAt})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          phone = EXCLUDED.phone,
          role = EXCLUDED.role,
          active = EXCLUDED.active
      `;
    } catch (e) {
      console.error("Failed to save staff member to database:", e);
    }
  });

export const saveSettingsDb = createServerFn({ method: "POST" })
  .validator((settings: Settings) => settings)
  .handler(async ({ data: settings }) => {
    if (!sql) return;
    try {
      await sql`
        INSERT INTO app_settings (id, data)
        VALUES ('main_settings', ${sql.json(settings)})
        ON CONFLICT (id) DO UPDATE SET
          data = EXCLUDED.data
      `;
    } catch (e) {
      console.error("Failed to save settings to database:", e);
    }
  });

export const saveCmsDb = createServerFn({ method: "POST" })
  .validator((cms: CmsContent) => cms)
  .handler(async ({ data: cms }) => {
    if (!sql) return;
    try {
      await sql`
        INSERT INTO cms_content (id, data)
        VALUES ('main_cms', ${sql.json(cms)})
        ON CONFLICT (id) DO UPDATE SET
          data = EXCLUDED.data
      `;
    } catch (e) {
      console.error("Failed to save CMS content to database:", e);
    }
  });

export const searchOrdersDb = createServerFn({ method: "POST" })
  .validator((params: { query?: string; statusFilter?: string }) => params)
  .handler(async ({ data: { query, statusFilter } }) => {
    if (!sql) return null;
    try {
      const q = query ? `%${query.trim().toLowerCase()}%` : null;
      let rows;
      if (q && statusFilter && statusFilter !== "all") {
        rows = await sql`
          SELECT * FROM orders 
          WHERE status = ${statusFilter}
            AND (
              LOWER(code) LIKE ${q} 
              OR LOWER(COALESCE(customer->>'name', '')) LIKE ${q} 
              OR LOWER(COALESCE(customer->>'phone', '')) LIKE ${q}
            )
          ORDER BY created_at DESC
        `;
      } else if (q) {
        rows = await sql`
          SELECT * FROM orders 
          WHERE 
            LOWER(code) LIKE ${q} 
            OR LOWER(COALESCE(customer->>'name', '')) LIKE ${q} 
            OR LOWER(COALESCE(customer->>'phone', '')) LIKE ${q}
          ORDER BY created_at DESC
        `;
      } else if (statusFilter && statusFilter !== "all") {
        rows = await sql`
          SELECT * FROM orders 
          WHERE status = ${statusFilter}
          ORDER BY created_at DESC
        `;
      } else {
        rows = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
      }
      return rows.map((o) => ({
        id: o.id,
        code: o.code,
        createdAt: Number(o.created_at),
        type: o.type as "pickup" | "delivery",
        lines: o.lines,
        subtotal: Number(o.subtotal),
        discount: Number(o.discount),
        voucherCode: o.voucher_code,
        deliveryFee: Number(o.delivery_fee),
        total: Number(o.total),
        status: o.status,
        paid: o.paid,
        paymentMethod: o.payment_method,
        pointsEarned: o.points_earned,
        etaMinutes: o.eta_minutes,
        customer: o.customer,
        accountId: o.account_id || null,
      })) as Order[];
    } catch (e) {
      console.error("Failed to search orders in database:", e);
      return null;
    }
  });

export const saveMediaAssetDb = createServerFn({ method: "POST" })
  .validator((d: MediaAsset) => d)
  .handler(async ({ data: m }) => {
    if (!sql) return;
    await sql`
      INSERT INTO media_assets (id, url, filename, uploaded_at, used_by_menu_ids)
      VALUES (${m.id}, ${m.url}, ${m.filename}, ${m.uploadedAt}, ${sql.json(m.usedByMenuIds)})
      ON CONFLICT (id) DO UPDATE SET
        url = EXCLUDED.url,
        filename = EXCLUDED.filename,
        used_by_menu_ids = EXCLUDED.used_by_menu_ids
    `;
  });

export const deleteMediaAssetDb = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    if (!sql) return;
    await sql`DELETE FROM media_assets WHERE id = ${id}`;
  });

export const updateMediaAssetUsageDb = createServerFn({ method: "POST" })
  .validator((d: { id: string; usedByMenuIds: string[] }) => d)
  .handler(async ({ data: d }) => {
    if (!sql) return;
    await sql`UPDATE media_assets SET used_by_menu_ids = ${sql.json(d.usedByMenuIds)} WHERE id = ${d.id}`;
  });

export const deleteAccountDb = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    if (!sql) return;
    await sql`DELETE FROM accounts WHERE id = ${id}`;
  });
