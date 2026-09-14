import postgres from "postgres";
import { type State } from "./store";

const connectionString = process.env.DATABASE_URL;

export const sql = connectionString
  ? postgres(connectionString, {
      ssl: connectionString.includes("sslmode=") ? undefined : "prefer",
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    })
  : null;

let isInitialized: boolean | null = null;

export async function initDb() {
  if (!sql) {
    console.log("DATABASE_URL is not set. Using in-memory store fallback.");
    return false;
  }

  if (isInitialized !== null) {
    return isInitialized;
  }

  try {
    // Test the connection quickly first
    await sql`SELECT 1`;

    // 1. Create tables
    await sql`
      CREATE TABLE IF NOT EXISTS app_settings (
        id VARCHAR(50) PRIMARY KEY,
        data JSONB NOT NULL
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS cms_content (
        id VARCHAR(50) PRIMARY KEY,
        data JSONB NOT NULL
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS menu_items (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price NUMERIC NOT NULL,
        category VARCHAR(100) NOT NULL,
        image TEXT,
        available BOOLEAN NOT NULL DEFAULT TRUE,
        prep_minutes INTEGER NOT NULL DEFAULT 15,
        badges JSONB NOT NULL DEFAULT '[]'::jsonb,
        stock INTEGER,
        groups JSONB NOT NULL DEFAULT '[]'::jsonb
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(50) PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        created_at BIGINT NOT NULL,
        type VARCHAR(20) NOT NULL,
        lines JSONB NOT NULL,
        subtotal NUMERIC NOT NULL,
        discount NUMERIC NOT NULL,
        voucher_code VARCHAR(50),
        delivery_fee NUMERIC NOT NULL,
        total NUMERIC NOT NULL,
        status VARCHAR(50) NOT NULL,
        paid BOOLEAN NOT NULL DEFAULT FALSE,
        payment_method VARCHAR(100) NOT NULL,
        points_earned INTEGER NOT NULL DEFAULT 0,
        eta_minutes INTEGER NOT NULL DEFAULT 15,
        customer JSONB NOT NULL
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS promos (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle TEXT NOT NULL,
        badge VARCHAR(100) NOT NULL,
        image_url TEXT,
        link TEXT,
        active BOOLEAN NOT NULL DEFAULT TRUE
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS vouchers (
        code VARCHAR(50) PRIMARY KEY,
        type VARCHAR(20) NOT NULL,
        value NUMERIC NOT NULL,
        min_spend NUMERIC NOT NULL,
        active BOOLEAN NOT NULL DEFAULT TRUE
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS accounts (
        id VARCHAR(50) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'user',
        address TEXT,
        addresses JSONB NOT NULL DEFAULT '[]'::jsonb,
        points INTEGER NOT NULL DEFAULT 0
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS staff (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(100) NOT NULL,
        role VARCHAR(50) NOT NULL,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at BIGINT NOT NULL
      )
    `;

    console.log("PostgreSQL tables checked/created successfully.");
    isInitialized = true;
    return true;
  } catch (error) {
    // PostgreSQL is unreachable or offline in this environment.
    // Fall back silently to the default state/in-memory store.
    isInitialized = false;
    return false;
  }
}

export async function seedDbIfEmpty(defaultState: Partial<State>) {
  if (!sql) return;

  try {
    // Seed Settings
    const settingsCount = await sql`SELECT COUNT(*) FROM app_settings`;
    if (parseInt(settingsCount[0].count) === 0) {
      await sql`
        INSERT INTO app_settings (id, data) 
        VALUES ('main_settings', ${sql.json(defaultState.settings)})
      `;
      console.log("Seeded app_settings.");
    }

    // Seed CMS
    const cmsCount = await sql`SELECT COUNT(*) FROM cms_content`;
    if (parseInt(cmsCount[0].count) === 0) {
      await sql`
        INSERT INTO cms_content (id, data) 
        VALUES ('main_cms', ${sql.json(defaultState.cms)})
      `;
      console.log("Seeded cms_content.");
    }

    // Seed Menu
    const menuCount = await sql`SELECT COUNT(*) FROM menu_items`;
    if (parseInt(menuCount[0].count) === 0) {
      for (const item of defaultState.menu) {
        await sql`
          INSERT INTO menu_items (id, name, description, price, category, image, available, prep_minutes, badges, stock, groups)
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
            ${item.stock || null}, 
            ${sql.json(item.groups)}
          )
        `;
      }
      console.log("Seeded menu_items.");
    }

    // Seed Promos
    const promosCount = await sql`SELECT COUNT(*) FROM promos`;
    if (parseInt(promosCount[0].count) === 0) {
      for (const promo of defaultState.promos) {
        await sql`
          INSERT INTO promos (id, title, subtitle, badge, image_url, link, active)
          VALUES (${promo.id}, ${promo.title}, ${promo.subtitle}, ${promo.badge}, ${promo.imageUrl || null}, ${promo.link || null}, ${promo.active ?? true})
        `;
      }
      console.log("Seeded promos.");
    }

    // Seed Vouchers
    const vouchersCount = await sql`SELECT COUNT(*) FROM vouchers`;
    if (parseInt(vouchersCount[0].count) === 0) {
      for (const v of defaultState.vouchers) {
        await sql`
          INSERT INTO vouchers (code, type, value, min_spend, active)
          VALUES (${v.code}, ${v.type}, ${v.value}, ${v.minSpend}, ${v.active})
        `;
      }
      console.log("Seeded vouchers.");
    }

    // Seed Accounts
    const accountsCount = await sql`SELECT COUNT(*) FROM accounts`;
    if (parseInt(accountsCount[0].count) === 0) {
      for (const acc of defaultState.accounts) {
        await sql`
          INSERT INTO accounts (id, email, password, name, phone, role, address, addresses, points)
          VALUES (${acc.id}, ${acc.email}, ${acc.password}, ${acc.name}, ${acc.phone}, ${acc.role || "user"}, ${acc.address || null}, ${sql.json(acc.addresses || [])}, ${acc.points || 0})
        `;
      }
      console.log("Seeded accounts.");
    }

    // Seed Staff
    const staffCount = await sql`SELECT COUNT(*) FROM staff`;
    if (parseInt(staffCount[0].count) === 0) {
      for (const st of defaultState.staff) {
        await sql`
          INSERT INTO staff (id, name, email, phone, role, active, created_at)
          VALUES (${st.id}, ${st.name}, ${st.email}, ${st.phone}, ${st.role}, ${st.active}, ${st.createdAt})
        `;
      }
      console.log("Seeded staff.");
    }
  } catch (error) {
    console.error("Failed to seed database:", error);
  }
}
