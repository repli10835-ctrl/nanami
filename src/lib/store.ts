import { useRef, useSyncExternalStore } from "react";
import food1 from "@/assets/food-1.jpg";
import food2 from "@/assets/food-2.jpg";
import food3 from "@/assets/food-3.jpg";
import food4 from "@/assets/food-4.jpg";
import {
  getDatabaseState,
  saveMenuItemDb,
  deleteMenuItemDb,
  saveOrderDb,
  saveVoucherDb,
  deleteVoucherDb,
  savePromoDb,
  deletePromoDb,
  saveAccountDb,
  saveStaffDb,
  saveSettingsDb,
  saveCmsDb,
  saveMediaAssetDb,
  deleteMediaAssetDb,
  updateMediaAssetUsageDb,
  deleteAccountDb,
  loginServerFn,
} from "./server-functions";
import { formatCurrency, setCurrencySymbol } from "./currency";

export type Category = "Meals" | "Snacks" | "Drinks" | "Combos" | "Others";
export const CATEGORIES: Category[] = ["Meals", "Snacks", "Drinks", "Combos", "Others"];

export type OptionChoice = { id: string; name: string; price: number };
export type OptionGroup = {
  id: string;
  name: string;
  type: "single" | "multi";
  enabled?: boolean;
  choices: OptionChoice[];
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image: string;
  available: boolean;
  prepMinutes: number;
  badges: string[];
  stock?: number | null;
  groups: OptionGroup[];
  specialRequestEnabled?: boolean;
};

export type CartLine = {
  id: string;
  itemId: string;
  name: string;
  unitPrice: number;
  qty: number;
  optionLabels: string[];
  note: string;
};

export type OrderStatus =
  | "Pending Payment"
  | "Cooking"
  | "Out for Delivery"
  | "Ready for Pickup"
  | "Completed"
  | "Cancelled";

export type Order = {
  id: string;
  code: string;
  createdAt: number;
  type: "pickup" | "delivery";
  lines: CartLine[];
  subtotal: number;
  vatAmount?: number | undefined;
  vatPercent?: number | undefined;
  discount: number;
  voucherCode: string;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paid: boolean;
  paymentMethod: string;
  pointsEarned: number;
  etaMinutes: number;
  customer: { name: string; phone: string; address: string; deliveryNote: string };
  accountId?: string | null;
};

export type Promo = {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  imageUrl?: string;
  link?: string;
  active?: boolean;
};

export type CmsFaq = {
  id: string;
  question: string;
  answer: string;
  active: boolean;
};

export type MediaAsset = {
  id: string;
  url: string;
  filename: string;
  uploadedAt: number;
  usedByMenuIds: string[];
};

export type CmsContent = {
  logoUrl: string;
  brandName: string;
  brandSuffix: string;
  tagline: string;
  description: string;
  heroImage: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroSlogan: string;
  heroCtaText: string;
  heroActive: boolean;
  announcement: {
    enabled: boolean;
    text: string;
    type: "info" | "promo" | "warning";
    link?: string;
  };
  welcomeScreen: {
    enabled: boolean;
    durationSec: number;
    title: string;
    subtitle: string;
    slogan: string;
    imageUrl: string;
  };
  socials: {
    instagram: string;
    tiktok: string;
    whatsapp: string;
    mapsUrl: string;
    active: boolean;
  };
  aboutStory: string;
  faqs: CmsFaq[];
  mustTryItemIds: string[];
  categoryOrder: Category[];
  categoryNames: Record<Category, string>;
};

export type Voucher = {
  code: string;
  type: "percent" | "fixed";
  value: number;
  minSpend: number;
  active: boolean;
};

export type Settings = {
  currencySymbol?: string;
  storeName: string;
  storeTagline: string;
  storeAddress: string;
  storeOpen: boolean;
  deliveryOn: boolean;
  pickupOn: boolean;
  codEnabled: boolean;
  vatEnabled: boolean;
  vatPercent: number;
  whatsapp: string;
  baseFee: number;
  feePerKm: number;
  maxRadiusKm: number;
  /** Store's Google Maps location point (link or "lat,lng"). */
  storeMapsUrl: string;
  storeLat: number;
  storeLng: number;
  /** Minimum delivery fee charged to customer. */
  minFee: number;
  /** Free delivery if subtotal >= this value (0 = disabled). */
  freeDeliveryAbove: number;
  /** Route factor: straight distance multiplied by this (e.g. 1.3). */
  routeFactor: number;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  ewallet: string;
  openHours: string;
  pointsPer10k: number;
  adminPassword: string;
};

export type Profile = {
  name: string;
  phone: string;
  email: string;
  address: string;
  addresses: string[];
  points: number;
  signedIn: boolean;
  method: string;
  role?: "user" | "admin" | "owner" | "staff" | undefined;
};

export type Account = {
  id: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  role?: "user" | "admin" | "owner" | "staff" | undefined;
  address?: string | undefined;
  addresses?: string[] | undefined;
  points?: number | undefined;
};

export type StaffRole = "owner" | "admin" | "staff";

export type StaffMember = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  active: boolean;
  createdAt: number;
};

export type State = {
  orderType: "pickup" | "delivery";
  orderTypeChosen: boolean;
  distanceKm: number;
  /** Customer's Google Maps point (link or "lat,lng"). */
  customerMapsUrl: string;
  menu: MenuItem[];
  cart: CartLine[];
  orders: Order[];
  settings: Settings;
  profile: Profile;
  promos: Promo[];
  vouchers: Voucher[];
  voucherCode: string;
  accounts: Account[];
  staff: StaffMember[];
  mediaAssets: MediaAsset[];
  adminUnlocked: boolean;
  cms: CmsContent;
};

const spice: OptionGroup = {
  id: "spice",
  name: "Spice Level",
  type: "single",
  enabled: true,
  choices: [
    { id: "mild", name: "Mild", price: 0 },
    { id: "medium", name: "Medium", price: 0 },
    { id: "hot", name: "Extra Hot", price: 5 },
  ],
};

const size: OptionGroup = {
  id: "size",
  name: "Size",
  type: "single",
  enabled: true,
  choices: [
    { id: "reg", name: "Regular", price: 0 },
    { id: "large", name: "Large", price: 15 },
  ],
};

const toppings: OptionGroup = {
  id: "topping",
  name: "Extra Toppings",
  type: "multi",
  enabled: true,
  choices: [
    { id: "egg", name: "Fried Egg", price: 15 },
    { id: "cheese", name: "Mozzarella Cheese", price: 20 },
    { id: "sambal", name: "Extra Chili Sauce", price: 10 },
  ],
};

export const seedMenu: MenuItem[] = [
  {
    id: "m1",
    name: "Teriyaki Chicken Bento",
    description: "Grilled teriyaki chicken with warm rice and Japanese pickles.",
    price: 95,
    category: "Meals",
    image: food1,
    available: true,
    prepMinutes: 15,
    badges: ["Halal-friendly", "Contains Soy"],
    groups: [size, toppings],
    specialRequestEnabled: true,
  },
  {
    id: "m2",
    name: "Crispy Smashed Chicken",
    description: "Crispy smashed chicken served with fresh chili sauce.",
    price: 85,
    category: "Meals",
    image: food2,
    available: true,
    prepMinutes: 18,
    badges: ["Halal-friendly", "Spicy"],
    groups: [spice, toppings],
    specialRequestEnabled: true,
  },
  {
    id: "m3",
    name: "Iced Milk Tea",
    description: "House brewed tea with fresh milk and brown sugar.",
    price: 35,
    category: "Drinks",
    image: food3,
    available: true,
    prepMinutes: 5,
    badges: ["Contains Dairy"],
    groups: [size],
    specialRequestEnabled: true,
  },
  {
    id: "m4",
    name: "Crispy Snack Platter",
    description: "Golden fried bites served with signature dipping sauce.",
    price: 65,
    category: "Snacks",
    image: food4,
    available: true,
    prepMinutes: 12,
    badges: ["Contains Gluten"],
    groups: [toppings],
    specialRequestEnabled: true,
  },
  {
    id: "m5",
    name: "Crispy Chicken & Tea Combo",
    description: "Smashed chicken, fragrant rice, and iced milk tea.",
    price: 110,
    category: "Combos",
    image: food2,
    available: true,
    prepMinutes: 20,
    badges: ["Halal-friendly", "Spicy"],
    groups: [spice],
    specialRequestEnabled: true,
  },
  {
    id: "m6",
    name: "Signature Chili Jar (150ml)",
    description: "Take our fiery chili sauce home. Fresh and spicy.",
    price: 45,
    category: "Others",
    image: food2,
    available: true,
    prepMinutes: 2,
    badges: ["Spicy", "Vegan"],
    groups: [],
    specialRequestEnabled: true,
  },
];

export const DEMO_ACCOUNTS: Account[] = [
  {
    id: "demo-owner",
    email: "owner@nanami.id",
    password: "owner123",
    name: "Nanami Owner",
    phone: "0834567890",
    role: "owner",
    address: "HQ Nanami Kitchen, Jakarta",
    addresses: ["HQ Nanami Kitchen, Jakarta"],
    points: 1500,
  },
  {
    id: "demo-admin",
    email: "admin@nanami.id",
    password: "admin123",
    name: "Kitchen Admin",
    phone: "0823456789",
    role: "admin",
    address: "Kitchen 1, Nanami Kitchen",
    addresses: ["Kitchen 1, Nanami Kitchen"],
    points: 120,
  },
  {
    id: "demo-staff",
    email: "staff@nanami.id",
    password: "staff123",
    name: "Kitchen Staff",
    phone: "0812-5555-6666",
    role: "staff",
    address: "Nanami Kitchen Line 1",
    addresses: ["Nanami Kitchen Line 1"],
    points: 0,
  },
  {
    id: "demo-user",
    email: "user@nanami.id",
    password: "user123",
    name: "Customer Nanami",
    phone: "0812345678",
    role: "user",
    address: "Jl. Sudirman No. 10, Jakarta",
    addresses: ["Jl. Sudirman No. 10, Jakarta"],
    points: 350,
  },
  {
    id: "legacy-user",
    email: "user@nanamikitchen.com",
    password: "user123",
    name: "David Smith",
    phone: "0812345678",
    role: "user",
    address: "12 Rosebank Road, Rosebank, Johannesburg",
    addresses: ["12 Rosebank Road, Rosebank, Johannesburg", "Building 4, Sandton City, Sandton"],
    points: 350,
  },
  {
    id: "legacy-admin",
    email: "admin@nanamikitchen.com",
    password: "admin123",
    name: "Sarah Jenkins",
    phone: "0823456789",
    role: "admin",
    address: "Kitchen 2, Rosebank Mall, Johannesburg",
    addresses: ["Kitchen 2, Rosebank Mall, Johannesburg"],
    points: 120,
  },
  {
    id: "legacy-staff",
    email: "staff@nanamikitchen.com",
    password: "staff123",
    name: "David Miller (Kitchen)",
    phone: "0812-5555-6666",
    role: "staff",
    address: "Nanami Kitchen Line 1",
    addresses: ["Nanami Kitchen Line 1"],
    points: 0,
  },
  {
    id: "legacy-owner",
    email: "owner@nanamikitchen.com",
    password: "owner123",
    name: "Nanami Miller",
    phone: "0834567890",
    role: "owner",
    address: "HQ Nanami Kitchen, Rosebank, Johannesburg",
    addresses: ["HQ Nanami Kitchen, Rosebank, Johannesburg"],
    points: 1500,
  },
];

export const defaultCmsContent: CmsContent = {
  logoUrl: "",
  brandName: "nanami",
  brandSuffix: "kitchen",
  tagline: "Good food, made with love.",
  description:
    "Delicious bento boxes, crispy chicken, snacks, and refreshing handcrafted drinks made fresh for families and co-workers.",
  heroImage: "",
  heroTitleLine1: "Good Food.",
  heroTitleLine2: "Made with Love",
  heroSlogan: "Good Food. Made with Love",
  heroCtaText: "Order Now",
  heroActive: true,
  announcement: {
    enabled: true,
    text: "🎉 Special Promo: Get 20% OFF all menu items with voucher code NANAMI20!",
    type: "promo",
    link: "/vouchers",
  },
  welcomeScreen: {
    enabled: true,
    durationSec: 2.6,
    title: "nanami",
    subtitle: "kitchen",
    slogan: "Good Food.\nMade with Love",
    imageUrl: "",
  },
  socials: {
    instagram: "@nanami.kitchen",
    tiktok: "@nanami.kitchen",
    whatsapp: "27812345678",
    mapsUrl: "https://maps.google.com/?q=Nanami+Kitchen",
    active: true,
  },
  aboutStory:
    "Nanami Kitchen serves authentic Japanese bento boxes, fiery crispy smashed chicken, and refreshing handcrafted beverages prepared fresh daily using high-quality ingredients.",
  faqs: [
    {
      id: "faq-1",
      question: "What is the estimated preparation and delivery time?",
      answer:
        "Orders are freshly cooked in 15–20 minutes. Delivery time depends on your distance (approx. 15–30 minutes).",
      active: true,
    },
    {
      id: "faq-2",
      question: "Does Nanami Kitchen offer a Pick-up (Takeaway) option?",
      answer: "Yes, you can choose Pick-up at checkout with zero delivery fee.",
      active: true,
    },
    {
      id: "faq-3",
      question: "How do I redeem a discount voucher?",
      answer: "Go to Vouchers, tap 'Apply' on your voucher or enter the code during Checkout.",
      active: true,
    },
    {
      id: "faq-4",
      question: "Which payment methods are accepted?",
      answer:
        "We accept Bank Transfer (EFT), E-Wallets / Capitec Pay, and Cash on Delivery / Pickup.",
      active: true,
    },
  ],
  mustTryItemIds: ["m1", "m2", "m3", "m4"],
  categoryOrder: ["Meals", "Snacks", "Drinks", "Combos", "Others"],
  categoryNames: {
    Meals: "Meals",
    Snacks: "Snacks",
    Drinks: "Drinks",
    Combos: "Combos",
    Others: "Others",
  },
};

const defaultState: State = {
  orderType: "delivery",
  orderTypeChosen: false,
  distanceKm: 3,
  customerMapsUrl: "",
  menu: seedMenu,
  cart: [],
  orders: [],
  settings: {
    currencySymbol: "N$",
    storeName: "Nanami Kitchen",
    storeTagline: "Japanese comfort food, made fresh daily",
    storeAddress: "12 Rosebank Road, Rosebank, Johannesburg",
    storeOpen: true,
    deliveryOn: true,
    pickupOn: true,
    codEnabled: true,
    vatEnabled: false,
    vatPercent: 15,
    whatsapp: "27812345678",
    baseFee: 25,
    feePerKm: 5,
    maxRadiusKm: 15,
    storeMapsUrl: "https://www.google.com/maps?q=-26.146,28.043",
    storeLat: -26.146,
    storeLng: 28.043,
    minFee: 25,
    freeDeliveryAbove: 250,
    routeFactor: 1.3,
    bankName: "Standard Bank / FNB",
    bankAccount: "62812345678",
    bankHolder: "Nanami Kitchen Pty Ltd",
    ewallet: "0812345678 (Capitec Pay / SnapScan)",
    openHours: "10:00 – 21:00 every day",
    pointsPer10k: 1,
    adminPassword: "nanami123",
  },
  profile: {
    name: "",
    phone: "",
    email: "",
    address: "",
    addresses: [],
    points: 0,
    signedIn: false,
    method: "",
    role: undefined,
  },
  promos: [
    {
      id: "p1",
      title: "Free delivery over N$ 250",
      subtitle: "Within 5 km radius of our kitchen",
      badge: "Delivery",
    },
    {
      id: "p2",
      title: "20% OFF all menu",
      subtitle: "Today only — use code NANAMI20",
      badge: "Special",
    },
    {
      id: "p3",
      title: "Earn points on every order",
      subtitle: "1 point for every N$ 100 spent",
      badge: "Loyalty",
    },
  ],
  vouchers: [
    { code: "NANAMI20", type: "percent", value: 20, minSpend: 0, active: true },
    { code: "SAVE20RAND", type: "fixed", value: 20, minSpend: 100, active: true },
  ],
  voucherCode: "",
  accounts: DEMO_ACCOUNTS,
  staff: [
    {
      id: "s1",
      name: "Nanami Owner",
      email: "owner@nanami.id",
      phone: "0812-1111-2222",
      role: "owner",
      active: true,
      createdAt: Date.parse("2025-01-10"),
    },
    {
      id: "s2",
      name: "Kitchen Admin",
      email: "admin@nanami.id",
      phone: "0812-3333-4444",
      role: "admin",
      active: true,
      createdAt: Date.parse("2025-03-02"),
    },
    {
      id: "s3",
      name: "Kitchen Staff",
      email: "staff@nanami.id",
      phone: "0812-5555-6666",
      role: "staff",
      active: true,
      createdAt: Date.parse("2025-06-18"),
    },
    {
      id: "s4",
      name: "Nanami Miller",
      email: "owner@nanamikitchen.com",
      phone: "0812-1111-2222",
      role: "owner",
      active: true,
      createdAt: Date.parse("2025-01-10"),
    },
  ],
  adminUnlocked: false,
  mediaAssets: [],
  cms: defaultCmsContent,
};

if (typeof window !== "undefined") {
  try {
    const saved = localStorage.getItem("nanami_auth_profile");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.signedIn) {
        defaultState.profile = parsed;
        defaultState.adminUnlocked =
          parsed.role === "admin" || parsed.role === "owner" || parsed.role === "staff";
      }
    }
  } catch (e) {
    console.debug(e);
  }
}

let state: State = defaultState;
const listeners = new Set<() => void>();

function set(updater: (s: State) => State) {
  state = updater(state);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("nanami_auth_profile", JSON.stringify(state.profile));
      localStorage.setItem("nanami_admin_unlocked", JSON.stringify(state.adminUnlocked));
    } catch (e) {
      console.debug(e);
    }
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function shallowEqual(a: unknown, b: unknown) {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  const ka = Object.keys(a as object);
  const kb = Object.keys(b as object);
  if (ka.length !== kb.length) return false;
  return ka.every((k) =>
    Object.is((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]),
  );
}

export function useStore<T>(selector: (s: State) => T): T {
  // Cache the derived snapshot so object-returning selectors stay referentially
  // stable between renders (otherwise useSyncExternalStore loops forever).
  const cache = useRef<{ value: T; base: State } | null>(null);

  const read = (base: State) => {
    if (cache.current && cache.current.base === base) {
      return cache.current.value;
    }
    const next = selector(base);
    if (cache.current && shallowEqual(cache.current.value, next)) {
      cache.current.base = base;
      return cache.current.value;
    }
    cache.current = { value: next, base };
    return next;
  };

  return useSyncExternalStore(
    subscribe,
    () => read(state),
    () => read(defaultState),
  );
}

export const actions = {
  async loadServerState() {
    try {
      const data = await getDatabaseState();
      if (data) {
        if (data.settings?.currencySymbol) {
          setCurrencySymbol(data.settings.currencySymbol);
        }
        set((s) => ({
          ...s,
          settings: data.settings ? { ...s.settings, ...data.settings } : s.settings,
          cms: data.cms ? { ...s.cms, ...data.cms } : s.cms,
          menu: data.menu && data.menu.length ? data.menu : s.menu,
          orders: data.orders && data.orders.length ? data.orders : s.orders,
          promos: data.promos && data.promos.length ? data.promos : s.promos,
          vouchers: data.vouchers && data.vouchers.length ? data.vouchers : s.vouchers,
          accounts: data.accounts && data.accounts.length ? data.accounts : s.accounts,
          staff: data.staff && data.staff.length ? data.staff : s.staff,
        }));
        console.log("State synchronized from PostgreSQL database successfully.");
      }
    } catch (error) {
      console.warn("Failed to load state from database server. Using local memory state.", error);
    }
  },
  setOrderType(type: "pickup" | "delivery") {
    set((s) => ({ ...s, orderType: type, orderTypeChosen: true }));
  },
  setDistanceKm(km: number) {
    set((s) => ({ ...s, distanceKm: Math.max(0.1, Math.round(km * 10) / 10) }));
  },
  /** Save customer's Google Maps point and the calculated distance. */
  setCustomerPoint(url: string, km: number) {
    set((s) => ({
      ...s,
      customerMapsUrl: url,
      distanceKm: Math.max(0.1, Math.round(km * 10) / 10),
    }));
  },
  setVoucherCode(code: string) {
    set((s) => ({ ...s, voucherCode: code.toUpperCase().trim() }));
  },
  saveVoucher(v: Voucher) {
    set((s) => ({
      ...s,
      vouchers: s.vouchers.some((x) => x.code === v.code)
        ? s.vouchers.map((x) => (x.code === v.code ? v : x))
        : [...s.vouchers, v],
    }));
    saveVoucherDb({ data: v }).catch(console.error);
  },
  deleteVoucher(code: string) {
    set((s) => ({ ...s, vouchers: s.vouchers.filter((v) => v.code !== code) }));
    deleteVoucherDb({ data: code }).catch(console.error);
  },
  savePromo(p: Promo) {
    set((s) => ({
      ...s,
      promos: s.promos.some((x) => x.id === p.id)
        ? s.promos.map((x) => (x.id === p.id ? p : x))
        : [...s.promos, p],
    }));
    savePromoDb({ data: p }).catch(console.error);
  },
  deletePromo(id: string) {
    set((s) => ({ ...s, promos: s.promos.filter((p) => p.id !== id) }));
    deletePromoDb({ data: id }).catch(console.error);
  },
  signUp(data: { name: string; email: string; phone: string; password: string }): {
    ok: boolean;
    error?: string;
    role?: "user" | "admin" | "owner" | "staff";
  } {
    const email = data.email.trim().toLowerCase();
    if (!email.includes("@")) return { ok: false, error: "Please enter a valid email address." };
    if (data.password.length < 6)
      return { ok: false, error: "Password must be at least 6 characters." };
    if (state.accounts.some((a) => a.email === email))
      return { ok: false, error: "This email is already registered. Please sign in." };
    const account: Account = {
      id: uid(),
      email,
      password: data.password,
      name: data.name.trim(),
      phone: data.phone.trim(),
    };
    set((s) => ({
      ...s,
      accounts: [...s.accounts, account],
      profile: {
        ...s.profile,
        name: account.name,
        email: account.email,
        phone: account.phone,
        role: "user",
        signedIn: true,
        method: "Email",
      },
    }));
    saveAccountDb({ data: account }).catch(console.error);
    return { ok: true, role: "user" };
  },
  async signIn(
    email: string,
    password: string,
  ): Promise<{ ok: boolean; error?: string; role?: "user" | "admin" | "owner" | "staff" }> {
    const clean = email.trim().toLowerCase();
    let account =
      state.accounts.find((a) => a.email.toLowerCase() === clean && a.password === password) ||
      DEMO_ACCOUNTS.find((a) => a.email.toLowerCase() === clean && a.password === password);

    if (!account) {
      try {
        const res = await loginServerFn({ data: { email: clean, password } });
        if (res.ok && res.account) {
          account = res.account;
          set((s) => ({
            ...s,
            accounts: s.accounts.some((a) => a.email.toLowerCase() === clean)
              ? s.accounts.map((a) => (a.email.toLowerCase() === clean ? account! : a))
              : [...s.accounts, account!],
          }));
        }
      } catch (err) {
        console.warn("Server login fallback error:", err);
      }
    }

    if (!account || account.password !== password)
      return { ok: false, error: "Invalid email or password." };

    const role = account.role ?? "user";
    set((s) => ({
      ...s,
      adminUnlocked: role === "admin" || role === "owner" || role === "staff",
      profile: {
        ...s.profile,
        name: account!.name,
        email: account!.email,
        phone: account!.phone,
        role,
        address: account!.address || s.profile.address,
        addresses:
          account!.addresses && account!.addresses.length
            ? account!.addresses
            : s.profile.addresses,
        points: account!.points !== undefined ? account!.points : s.profile.points,
        signedIn: true,
        method: "Email",
      },
    }));
    return { ok: true, role };
  },
  loginAsDemo(role: "user" | "admin" | "owner" | "staff"): {
    ok: boolean;
    error?: string;
    role?: "user" | "admin" | "owner" | "staff";
  } {
    const demo = DEMO_ACCOUNTS.find((a) => a.role === role);
    if (!demo) return { ok: false, error: "Demo account not found." };
    const cleanRole = demo.role ?? role;
    set((s) => ({
      ...s,
      adminUnlocked: cleanRole === "admin" || cleanRole === "owner" || cleanRole === "staff",
      profile: {
        ...s.profile,
        name: demo.name,
        email: demo.email,
        phone: demo.phone,
        role: cleanRole,
        address: demo.address || s.profile.address,
        addresses: demo.addresses && demo.addresses.length ? demo.addresses : s.profile.addresses,
        points: demo.points !== undefined ? demo.points : s.profile.points,
        signedIn: true,
        method: "Demo",
      },
    }));
    return { ok: true, role: cleanRole };
  },
  changePassword(currentPassword: string, newPassword: string): { ok: boolean; error?: string } {
    const email = state.profile.email;
    const account = state.accounts.find((a) => a.email === email);
    if (!account || account.password !== currentPassword)
      return { ok: false, error: "Current password is incorrect." };
    if (newPassword.length < 6)
      return { ok: false, error: "New password must be at least 6 characters." };
    set((s) => ({
      ...s,
      accounts: s.accounts.map((a) => (a.id === account.id ? { ...a, password: newPassword } : a)),
    }));
    return { ok: true };
  },
  signOut() {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("nanami_auth_profile");
        localStorage.removeItem("nanami_admin_unlocked");
      } catch (e) {
        console.debug(e);
      }
    }
    set((s) => ({ ...s, profile: { ...defaultState.profile }, adminUnlocked: false }));
  },
  unlockAdmin(password: string): boolean {
    if (password !== state.settings.adminPassword) return false;
    set((s) => ({ ...s, adminUnlocked: true }));
    return true;
  },
  lockAdmin() {
    set((s) => ({ ...s, adminUnlocked: false }));
  },
  setStock(id: string, stock: number | null) {
    set((s) => {
      const updatedMenu = s.menu.map((m) =>
        m.id === id ? { ...m, stock, available: stock === null ? m.available : stock > 0 } : m,
      );
      const updatedItem = updatedMenu.find((m) => m.id === id);
      if (updatedItem) {
        saveMenuItemDb({ data: updatedItem }).catch(console.error);
      }
      return { ...s, menu: updatedMenu };
    });
  },
  saveAddress(address: string) {
    set((s) => {
      const updatedProfile = {
        ...s.profile,
        address,
        addresses: s.profile.addresses.includes(address)
          ? s.profile.addresses
          : [address, ...s.profile.addresses].slice(0, 5),
      };

      // Sync profile's user account with db
      const account = s.accounts.find((a) => a.email === s.profile.email);
      if (account) {
        const updatedAcc = { ...account, address, addresses: updatedProfile.addresses };
        saveAccountDb({ data: updatedAcc }).catch(console.error);
      }

      return { ...s, profile: updatedProfile };
    });
  },
  removeAddress(address: string) {
    set((s) => {
      const updatedProfile = {
        ...s.profile,
        addresses: s.profile.addresses.filter((a) => a !== address),
      };

      const account = s.accounts.find((a) => a.email === s.profile.email);
      if (account) {
        const updatedAcc = { ...account, addresses: updatedProfile.addresses };
        saveAccountDb({ data: updatedAcc }).catch(console.error);
      }

      return { ...s, profile: updatedProfile };
    });
  },
  addToCart(line: Omit<CartLine, "id">) {
    set((s) => ({ ...s, cart: [...s.cart, { ...line, id: uid() }] }));
  },
  setQty(lineId: string, qty: number) {
    set((s) => ({
      ...s,
      cart:
        qty <= 0
          ? s.cart.filter((l) => l.id !== lineId)
          : s.cart.map((l) => (l.id === lineId ? { ...l, qty } : l)),
    }));
  },
  clearCart() {
    set((s) => ({ ...s, cart: [], voucherCode: "" }));
  },
  placeOrder(order: Omit<Order, "id" | "code" | "createdAt" | "status" | "paid" | "pointsEarned">) {
    const isMember = Boolean(state.profile.signedIn);
    const pointsEarned = isMember
      ? Math.floor(order.total / 10000) * state.settings.pointsPer10k
      : 0;
    const accountId = isMember
      ? state.accounts.find((a) => a.email.toLowerCase() === state.profile.email.toLowerCase())
          ?.id || null
      : null;

    const full: Order = {
      ...order,
      id: uid(),
      code: "NK-" + Math.floor(1000 + Math.random() * 9000),
      createdAt: Date.now(),
      status: "Pending Payment",
      paid: false,
      pointsEarned,
      accountId,
    };
    set((s) => {
      const updatedMenu = s.menu.map((m) => {
        if (m.stock === null || m.stock === undefined) return m;
        const ordered = full.lines
          .filter((l) => l.itemId === m.id)
          .reduce((sum, l) => sum + l.qty, 0);
        if (!ordered) return m;
        const stock = Math.max(0, m.stock - ordered);
        const updated = { ...m, stock, available: stock > 0 };
        saveMenuItemDb({ data: updated }).catch(console.error);
        return updated;
      });

      // Save order to db
      saveOrderDb({ data: full }).catch(console.error);

      // Save updated points for profile only if member
      let updatedPoints = s.profile.points;
      if (isMember && s.profile.email) {
        const account = s.accounts.find(
          (a) => a.email.toLowerCase() === s.profile.email.toLowerCase(),
        );
        updatedPoints = s.profile.points + pointsEarned;
        if (account) {
          const updatedAcc = { ...account, points: updatedPoints };
          saveAccountDb({ data: updatedAcc }).catch(console.error);
        }
      }

      return {
        ...s,
        orders: [full, ...s.orders],
        cart: [],
        voucherCode: "",
        menu: updatedMenu,
        profile: isMember ? { ...s.profile, points: updatedPoints } : s.profile,
      };
    });
    return full;
  },
  setOrderStatus(id: string, status: OrderStatus) {
    set((s) => {
      const updatedOrders = s.orders.map((o) =>
        o.id === id ? { ...o, status, paid: o.paid || status !== "Pending Payment" } : o,
      );
      const updatedOrder = updatedOrders.find((o) => o.id === id);
      if (updatedOrder) {
        saveOrderDb({ data: updatedOrder }).catch(console.error);
      }
      return { ...s, orders: updatedOrders };
    });
  },
  markPaid(id: string) {
    set((s) => {
      const updatedOrders: Order[] = s.orders.map((o) =>
        o.id === id ? { ...o, paid: true, status: "Cooking" as OrderStatus } : o,
      );
      const updatedOrder = updatedOrders.find((o) => o.id === id);
      if (updatedOrder) {
        saveOrderDb({ data: updatedOrder }).catch(console.error);
      }
      return { ...s, orders: updatedOrders };
    });
  },
  saveMenuItem(item: MenuItem) {
    set((s) => {
      const oldItem = s.menu.find((m) => m.id === item.id);
      let updatedMediaAssets = [...s.mediaAssets];

      if (!oldItem || oldItem.image !== item.image) {
        if (oldItem && oldItem.image) {
          updatedMediaAssets = updatedMediaAssets.map((asset) => {
            if (asset.url === oldItem.image) {
              const newUsage = asset.usedByMenuIds.filter((id) => id !== item.id);
              updateMediaAssetUsageDb({ data: { id: asset.id, usedByMenuIds: newUsage } }).catch(
                console.error,
              );
              return { ...asset, usedByMenuIds: newUsage };
            }
            return asset;
          });
        }
        if (item.image) {
          updatedMediaAssets = updatedMediaAssets.map((asset) => {
            if (asset.url === item.image) {
              const newUsage = Array.from(new Set([...asset.usedByMenuIds, item.id]));
              updateMediaAssetUsageDb({ data: { id: asset.id, usedByMenuIds: newUsage } }).catch(
                console.error,
              );
              return { ...asset, usedByMenuIds: newUsage };
            }
            return asset;
          });
        }
      }

      saveMenuItemDb({ data: item }).catch(console.error);
      return {
        ...s,
        menu: s.menu.some((m) => m.id === item.id)
          ? s.menu.map((m) => (m.id === item.id ? item : m))
          : [...s.menu, item],
        mediaAssets: updatedMediaAssets,
      };
    });
  },
  deleteMenuItem(id: string) {
    set((s) => {
      const item = s.menu.find((m) => m.id === id);
      let updatedMediaAssets = [...s.mediaAssets];
      if (item && item.image) {
        updatedMediaAssets = updatedMediaAssets.map((asset) => {
          if (asset.url === item.image) {
            const newUsage = asset.usedByMenuIds.filter((uid) => uid !== id);
            updateMediaAssetUsageDb({ data: { id: asset.id, usedByMenuIds: newUsage } }).catch(
              console.error,
            );
            return { ...asset, usedByMenuIds: newUsage };
          }
          return asset;
        });
      }
      deleteMenuItemDb({ data: id }).catch(console.error);
      return {
        ...s,
        menu: s.menu.filter((m) => m.id !== id),
        mediaAssets: updatedMediaAssets,
      };
    });
  },
  toggleAvailability(id: string) {
    set((s) => {
      const updatedMenu = s.menu.map((m) => (m.id === id ? { ...m, available: !m.available } : m));
      const updatedItem = updatedMenu.find((m) => m.id === id);
      if (updatedItem) {
        saveMenuItemDb({ data: updatedItem }).catch(console.error);
      }
      return { ...s, menu: updatedMenu };
    });
  },
  setAvailability(id: string, available: boolean) {
    set((s) => {
      const updatedMenu = s.menu.map((m) => (m.id === id ? { ...m, available } : m));
      const updatedItem = updatedMenu.find((m) => m.id === id);
      if (updatedItem) {
        saveMenuItemDb({ data: updatedItem }).catch(console.error);
      }
      return { ...s, menu: updatedMenu };
    });
  },
  setAllAvailability(available: boolean) {
    set((s) => {
      s.menu.forEach((m) => {
        saveMenuItemDb({ data: { ...m, available } }).catch(console.error);
      });
      return { ...s, menu: s.menu.map((m) => ({ ...m, available })) };
    });
  },
  saveStaff(member: StaffMember) {
    set((s) => ({
      ...s,
      staff: s.staff.some((x) => x.id === member.id)
        ? s.staff.map((x) => (x.id === member.id ? member : x))
        : [...s.staff, member],
    }));
    saveStaffDb({ data: member }).catch(console.error);
  },
  updateStaff(id: string, patch: Partial<StaffMember>) {
    set((s) => {
      const updatedStaff = s.staff.map((x) => (x.id === id ? { ...x, ...patch } : x));
      const updatedMember = updatedStaff.find((x) => x.id === id);
      if (updatedMember) {
        saveStaffDb({ data: updatedMember }).catch(console.error);
      }
      return { ...s, staff: updatedStaff };
    });
  },
  deleteStaff(id: string) {
    set((s) => {
      const staffMember = s.staff.find((x) => x.id === id);
      if (staffMember) {
        // Soft delete/mark inactive in database
        saveStaffDb({ data: { ...staffMember, active: false } }).catch(console.error);
      }
      return { ...s, staff: s.staff.filter((x) => x.id !== id) };
    });
  },
  updateSettings(patch: Partial<Settings>) {
    set((s) => {
      if (patch.currencySymbol) {
        setCurrencySymbol(patch.currencySymbol);
      }
      const updated = { ...s.settings, ...patch };
      saveSettingsDb({ data: updated }).catch(console.error);
      return { ...s, settings: updated };
    });
  },
  updateProfile(patch: Partial<Profile>) {
    set((s) => {
      const updatedProfile = { ...s.profile, ...patch };

      // Update matching user account in db only if user is logged in
      if (s.profile.signedIn && s.profile.email) {
        const account = s.accounts.find(
          (a) => a.email.toLowerCase() === s.profile.email.toLowerCase(),
        );
        if (account) {
          const updatedAcc = {
            ...account,
            name: updatedProfile.name || account.name,
            phone: updatedProfile.phone || account.phone,
            address: updatedProfile.address || account.address,
            addresses: updatedProfile.addresses.length
              ? updatedProfile.addresses
              : account.addresses,
            points: updatedProfile.points,
          };
          saveAccountDb({ data: updatedAcc }).catch(console.error);
        }
      }

      return { ...s, profile: updatedProfile };
    });
  },
  updateCms(patch: Partial<CmsContent>) {
    set((s) => {
      const updated = { ...s.cms, ...patch };
      saveCmsDb({ data: updated }).catch(console.error);
      return { ...s, cms: updated };
    });
  },
  updateCmsAnnouncement(patch: Partial<CmsContent["announcement"]>) {
    set((s) => {
      const updated = {
        ...s.cms,
        announcement: { ...s.cms.announcement, ...patch },
      };
      saveCmsDb({ data: updated }).catch(console.error);
      return { ...s, cms: updated };
    });
  },
  updateCmsWelcome(patch: Partial<CmsContent["welcomeScreen"]>) {
    set((s) => {
      const updated = {
        ...s.cms,
        welcomeScreen: { ...s.cms.welcomeScreen, ...patch },
      };
      saveCmsDb({ data: updated }).catch(console.error);
      return { ...s, cms: updated };
    });
  },
  updateCmsSocials(patch: Partial<CmsContent["socials"]>) {
    set((s) => {
      const updated = {
        ...s.cms,
        socials: { ...s.cms.socials, ...patch },
      };
      saveCmsDb({ data: updated }).catch(console.error);
      return { ...s, cms: updated };
    });
  },
  addCmsFaq(faq: { question: string; answer: string; active?: boolean }) {
    const newFaq: CmsFaq = {
      id: "faq-" + uid(),
      question: faq.question.trim(),
      answer: faq.answer.trim(),
      active: faq.active ?? true,
    };
    set((s) => {
      const updated = {
        ...s.cms,
        faqs: [...s.cms.faqs, newFaq],
      };
      saveCmsDb({ data: updated }).catch(console.error);
      return { ...s, cms: updated };
    });
  },
  updateCmsFaq(id: string, patch: Partial<CmsFaq>) {
    set((s) => {
      const updated = {
        ...s.cms,
        faqs: s.cms.faqs.map((f) => (f.id === id ? { ...f, ...patch } : f)),
      };
      saveCmsDb({ data: updated }).catch(console.error);
      return { ...s, cms: updated };
    });
  },
  deleteCmsFaq(id: string) {
    set((s) => {
      const updated = {
        ...s.cms,
        faqs: s.cms.faqs.filter((f) => f.id !== id),
      };
      saveCmsDb({ data: updated }).catch(console.error);
      return { ...s, cms: updated };
    });
  },
  saveMediaAsset(asset: MediaAsset) {
    set((s) => ({
      ...s,
      mediaAssets: s.mediaAssets.some((m) => m.id === asset.id)
        ? s.mediaAssets.map((m) => (m.id === asset.id ? asset : m))
        : [...s.mediaAssets, asset],
    }));
    saveMediaAssetDb({ data: asset }).catch(console.error);
  },
  deleteMediaAsset(id: string) {
    set((s) => ({
      ...s,
      mediaAssets: s.mediaAssets.filter((m) => m.id !== id),
    }));
    deleteMediaAssetDb({ data: id }).catch(console.error);
  },
  saveAccount(acc: Account) {
    set((s) => ({
      ...s,
      accounts: s.accounts.some((a) => a.id === acc.id)
        ? s.accounts.map((a) => (a.id === acc.id ? acc : a))
        : [...s.accounts, acc],
    }));
    saveAccountDb({ data: acc }).catch(console.error);
  },
  deleteAccount(id: string) {
    set((s) => ({
      ...s,
      accounts: s.accounts.filter((a) => a.id !== id),
    }));
    deleteAccountDb({ data: id }).catch(console.error);
  },
  resetCms() {
    set((s) => {
      saveCmsDb({ data: defaultCmsContent }).catch(console.error);
      return {
        ...s,
        cms: defaultCmsContent,
      };
    });
  },
};

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export { formatCurrency } from "./currency";

export function rupiah(n: number) {
  return formatCurrency(n, state?.settings?.currencySymbol || "N$");
}

export function formatRand(n: number) {
  return rupiah(n);
}

export function cartTotals(cart: CartLine[]) {
  const subtotal = cart.reduce((sum, l) => sum + l.unitPrice * l.qty, 0);
  const items = cart.reduce((sum, l) => sum + l.qty, 0);
  return { subtotal, items };
}

/** Single source of truth for the delivery fee across cart, address and checkout. */
export function deliveryFeeFor(
  settings: Settings,
  orderType: "pickup" | "delivery",
  distanceKm: number,
  subtotal = 0,
) {
  if (orderType !== "delivery") return 0;
  if (settings.freeDeliveryAbove > 0 && subtotal >= settings.freeDeliveryAbove) return 0;
  const km = Math.max(0, Math.ceil(distanceKm * 10) / 10);
  const fee = settings.baseFee + km * settings.feePerKm;
  return Math.max(settings.minFee ?? 0, Math.round(fee));
}

export { buildWhatsappMessage, cleanWhatsappNumber } from "./whatsapp";

export function findVoucher(vouchers: Voucher[], code: string) {
  const clean = code.trim().toUpperCase();
  return vouchers.find((v) => v.code === clean && v.active);
}

export function discountFor(subtotal: number, voucher?: Voucher) {
  if (!voucher || subtotal < voucher.minSpend) return 0;
  const value =
    voucher.type === "percent" ? Math.round((subtotal * voucher.value) / 100) : voucher.value;
  return Math.min(value, subtotal);
}
