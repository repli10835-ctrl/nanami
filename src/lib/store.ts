import { useRef, useSyncExternalStore } from "react";
import food1 from "@/assets/food-1.jpg";
import food2 from "@/assets/food-2.jpg";
import food3 from "@/assets/food-3.jpg";
import food4 from "@/assets/food-4.jpg";

export type Category = "Foods" | "Snacks" | "Drinks" | "Combos" | "Others";
export const CATEGORIES: Category[] = ["Foods", "Snacks", "Drinks", "Combos", "Others"];

export type OptionChoice = { id: string; name: string; price: number };
export type OptionGroup = {
  id: string;
  name: string;
  type: "single" | "multi";
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
  };
  aboutStory: string;
  faqs: CmsFaq[];
};

export type Voucher = {
  code: string;
  type: "percent" | "fixed";
  value: number;
  minSpend: number;
  active: boolean;
};

export type Settings = {
  storeName: string;
  storeTagline: string;
  storeAddress: string;
  storeOpen: boolean;
  deliveryOn: boolean;
  pickupOn: boolean;
  whatsapp: string;
  baseFee: number;
  feePerKm: number;
  maxRadiusKm: number;
  /** Titik Google Maps lokasi usaha (tautan atau "lat,lng"). */
  storeMapsUrl: string;
  storeLat: number;
  storeLng: number;
  /** Ongkir minimum yang ditagihkan ke pelanggan. */
  minFee: number;
  /** Gratis ongkir jika subtotal >= nilai ini (0 = nonaktif). */
  freeDeliveryAbove: number;
  /** Faktor jalan: jarak lurus dikali angka ini (mis. 1.3). */
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
  role?: "user" | "admin" | "owner";
};

export type Account = {
  id: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  role?: "user" | "admin" | "owner";
  address?: string;
  addresses?: string[];
  points?: number;
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
  /** Titik Google Maps pelanggan (tautan atau "lat,lng"). */
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
  adminUnlocked: boolean;
  cms: CmsContent;
};

const spice: OptionGroup = {
  id: "spice",
  name: "Spice Level",
  type: "single",
  choices: [
    { id: "mild", name: "Mild", price: 0 },
    { id: "medium", name: "Medium", price: 0 },
    { id: "hot", name: "Extra Hot", price: 2000 },
  ],
};

const size: OptionGroup = {
  id: "size",
  name: "Size",
  type: "single",
  choices: [
    { id: "reg", name: "Regular", price: 0 },
    { id: "large", name: "Large", price: 8000 },
  ],
};

const toppings: OptionGroup = {
  id: "topping",
  name: "Extra Toppings",
  type: "multi",
  choices: [
    { id: "egg", name: "Fried Egg", price: 6000 },
    { id: "cheese", name: "Mozzarella", price: 9000 },
    { id: "sambal", name: "Extra Sambal", price: 3000 },
  ],
};

const seedMenu: MenuItem[] = [
  {
    id: "m1",
    name: "Bento Ayam Teriyaki",
    description: "Grilled teriyaki chicken with warm rice and pickles.",
    price: 42000,
    category: "Foods",
    image: food1,
    available: true,
    prepMinutes: 15,
    badges: ["Halal-friendly", "Contains Soy"],
    groups: [size, toppings],
  },
  {
    id: "m2",
    name: "Ayam Geprek Sambal",
    description: "Crispy smashed chicken with fresh chili sambal.",
    price: 38000,
    category: "Foods",
    image: food2,
    available: true,
    prepMinutes: 18,
    badges: ["Halal-friendly", "Spicy"],
    groups: [spice, toppings],
  },
  {
    id: "m3",
    name: "Iced Milk Tea",
    description: "House brewed tea with fresh milk and palm sugar.",
    price: 22000,
    category: "Drinks",
    image: food3,
    available: true,
    prepMinutes: 5,
    badges: ["Contains Dairy"],
    groups: [size],
  },
  {
    id: "m4",
    name: "Crispy Snack Platter",
    description: "Golden fried bites served with signature dipping sauce.",
    price: 30000,
    category: "Snacks",
    image: food4,
    available: true,
    prepMinutes: 12,
    badges: ["Contains Gluten"],
    groups: [toppings],
  },
  {
    id: "m5",
    name: "Combo Geprek + Tea",
    description: "Ayam geprek, rice and an iced milk tea. Best value.",
    price: 55000,
    category: "Combos",
    image: food2,
    available: true,
    prepMinutes: 20,
    badges: ["Halal-friendly", "Spicy"],
    groups: [spice],
  },
  {
    id: "m6",
    name: "Sambal Jar 150ml",
    description: "Take our sambal home. Fiery and fragrant.",
    price: 18000,
    category: "Others",
    image: food2,
    available: true,
    prepMinutes: 2,
    badges: ["Spicy", "Vegan"],
    groups: [],
  },
];

export const DEMO_ACCOUNTS: Account[] = [
  {
    id: "demo-user",
    email: "user@nanami.id",
    password: "user123",
    name: "Budi Pratama",
    phone: "0812-9876-5432",
    role: "user",
    address: "Jl. Melati No. 12, Kebayoran Baru, Jakarta Selatan",
    addresses: [
      "Jl. Melati No. 12, Kebayoran Baru, Jakarta Selatan",
      "Office Tower Lt. 14, SCBD, Jakarta Pusat",
    ],
    points: 350,
  },
  {
    id: "demo-admin",
    email: "admin@nanami.id",
    password: "admin123",
    name: "Rina Astuti",
    phone: "0812-3333-4444",
    role: "admin",
    address: "Kitchen Nanami Kitchen, Jl. Radio Dalam",
    addresses: ["Kitchen Nanami Kitchen, Jl. Radio Dalam"],
    points: 120,
  },
  {
    id: "demo-owner",
    email: "owner@nanami.id",
    password: "owner123",
    name: "Nanami Putri",
    phone: "0812-1111-2222",
    role: "owner",
    address: "HQ Nanami Kitchen, Senopati",
    addresses: ["HQ Nanami Kitchen, Senopati"],
    points: 1500,
  },
];

export const defaultCmsContent: CmsContent = {
  logoUrl: "",
  brandName: "nanami",
  brandSuffix: "kitchen",
  tagline: "Good food, made with love.",
  description:
    "Dapur bento, geprek, camilan, dan minuman lezat siap saji untuk keluarga dan rekan kerja.",
  heroImage: "",
  heroTitleLine1: "Good Food.",
  heroTitleLine2: "Made with Love",
  heroSlogan: "Good Food. Made with Love",
  heroCtaText: "Pesan Sekarang",
  announcement: {
    enabled: true,
    text: "🎉 Promo Spesial: Diskon 20% semua menu dengan voucher NANAMI20!",
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
    whatsapp: "0812-3456-7890",
    mapsUrl: "https://maps.google.com/?q=Nanami+Kitchen",
  },
  aboutStory:
    "Nanami Kitchen menyajikan sajian bento Jepang autentik, aneka olahan geprek lezat pedas gurih, dan minuman segar yang diolah secara higienis menggunakan bahan-bahan pilihan berkualitas setiap hari.",
  faqs: [
    {
      id: "faq-1",
      question: "Berapa lama estimasi waktu masak dan pengantaran pesanan?",
      answer:
        "Rata-rata pesanan dimasak dalam 15-20 menit. Pengantaran kurir disesuaikan dengan jarak outlet (sekitar 15-30 menit).",
      active: true,
    },
    {
      id: "faq-2",
      question: "Apakah Nanami Kitchen menyediakan opsi Pick-up (Ambil Sendiri)?",
      answer:
        "Ya, Anda dapat memilih metode Pick-up saat checkout tanpa dikenakan biaya ongkos kirim.",
      active: true,
    },
    {
      id: "faq-3",
      question: "Bagaimana cara menggunakan voucher diskon?",
      answer:
        "Buka menu Voucher, klik 'Gunakan' pada voucher yang Anda inginkan atau ketik kode voucher pada halaman Checkout.",
      active: true,
    },
    {
      id: "faq-4",
      question: "Metode pembayaran apa saja yang diterima?",
      answer:
        "Kami menerima Transfer Bank (BCA), E-Wallet (GoPay, OVO, ShopeePay, DANA), dan Bayar di Tempat (COD / Cash on Pickup).",
      active: true,
    },
  ],
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
    storeName: "Nanami Kitchen",
    storeTagline: "Japanese comfort food, dibuat segar tiap hari",
    storeAddress: "Jl. Melati Raya No. 12, Jakarta Selatan",
    storeOpen: true,
    deliveryOn: true,
    pickupOn: true,
    whatsapp: "628123456789",
    baseFee: 8000,
    feePerKm: 3000,
    maxRadiusKm: 10,
    storeMapsUrl: "https://www.google.com/maps?q=-6.261493,106.781194",
    storeLat: -6.261493,
    storeLng: 106.781194,
    minFee: 8000,
    freeDeliveryAbove: 0,
    routeFactor: 1.3,
    bankName: "BCA",
    bankAccount: "1234567890",
    bankHolder: "Nanami Kitchen",
    ewallet: "0812-3456-789 (OVO / GoPay)",
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
      title: "20% OFF all menu",
      subtitle: "Today only — use code NANAMI20",
      badge: "Special",
    },
    {
      id: "p2",
      title: "Free delivery over Rp 100.000",
      subtitle: "Within 5 km of the kitchen",
      badge: "Delivery",
    },
    {
      id: "p3",
      title: "Earn points on every order",
      subtitle: "1 point per Rp 10.000 spent",
      badge: "Loyalty",
    },
  ],
  vouchers: [
    { code: "NANAMI20", type: "percent", value: 20, minSpend: 0, active: true },
    { code: "HEMAT10K", type: "fixed", value: 10000, minSpend: 60000, active: true },
  ],
  voucherCode: "",
  accounts: DEMO_ACCOUNTS,
  staff: [
    {
      id: "s1",
      name: "Nanami Putri",
      email: "owner@nanami.id",
      phone: "0812-1111-2222",
      role: "owner",
      active: true,
      createdAt: Date.parse("2025-01-10"),
    },
    {
      id: "s2",
      name: "Rina Astuti",
      email: "rina@nanami.id",
      phone: "0812-3333-4444",
      role: "admin",
      active: true,
      createdAt: Date.parse("2025-03-02"),
    },
    {
      id: "s3",
      name: "Dimas Pratama",
      email: "dimas@nanami.id",
      phone: "0812-5555-6666",
      role: "staff",
      active: true,
      createdAt: Date.parse("2025-06-18"),
    },
  ],
  adminUnlocked: false,
  cms: defaultCmsContent,
};

let state: State = defaultState;
const listeners = new Set<() => void>();

function set(updater: (s: State) => State) {
  state = updater(state);
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
  setOrderType(type: "pickup" | "delivery") {
    set((s) => ({ ...s, orderType: type, orderTypeChosen: true }));
  },
  setDistanceKm(km: number) {
    set((s) => ({ ...s, distanceKm: Math.max(0.1, Math.round(km * 10) / 10) }));
  },
  /** Simpan titik Google Maps pelanggan beserta jarak hasil hitungan. */
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
  },
  deleteVoucher(code: string) {
    set((s) => ({ ...s, vouchers: s.vouchers.filter((v) => v.code !== code) }));
  },
  savePromo(p: Promo) {
    set((s) => ({
      ...s,
      promos: s.promos.some((x) => x.id === p.id)
        ? s.promos.map((x) => (x.id === p.id ? p : x))
        : [...s.promos, p],
    }));
  },
  deletePromo(id: string) {
    set((s) => ({ ...s, promos: s.promos.filter((p) => p.id !== id) }));
  },
  signUp(data: { name: string; email: string; phone: string; password: string }): {
    ok: boolean;
    error?: string;
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
    return { ok: true, role: "user" as const };
  },
  signIn(
    email: string,
    password: string,
  ): { ok: boolean; error?: string; role?: "user" | "admin" | "owner" } {
    const clean = email.trim().toLowerCase();
    const account =
      state.accounts.find((a) => a.email.toLowerCase() === clean) ||
      DEMO_ACCOUNTS.find((a) => a.email.toLowerCase() === clean);
    if (!account || account.password !== password)
      return { ok: false, error: "Email atau kata sandi tidak sesuai." };

    const role = account.role ?? "user";
    set((s) => ({
      ...s,
      adminUnlocked: role === "admin" || role === "owner",
      profile: {
        ...s.profile,
        name: account.name,
        email: account.email,
        phone: account.phone,
        role,
        address: account.address || s.profile.address,
        addresses:
          account.addresses && account.addresses.length ? account.addresses : s.profile.addresses,
        points: account.points !== undefined ? account.points : s.profile.points,
        signedIn: true,
        method: "Email",
      },
    }));
    return { ok: true, role };
  },
  loginAsDemo(role: "user" | "admin" | "owner"): {
    ok: boolean;
    error?: string;
    role?: "user" | "admin" | "owner";
  } {
    const demo = DEMO_ACCOUNTS.find((a) => a.role === role);
    if (!demo) return { ok: false, error: "Akun demo tidak ditemukan." };
    return this.signIn(demo.email, demo.password);
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
    set((s) => ({
      ...s,
      menu: s.menu.map((m) =>
        m.id === id ? { ...m, stock, available: stock === null ? m.available : stock > 0 } : m,
      ),
    }));
  },
  saveAddress(address: string) {
    set((s) => ({
      ...s,
      profile: {
        ...s.profile,
        address,
        addresses: s.profile.addresses.includes(address)
          ? s.profile.addresses
          : [address, ...s.profile.addresses].slice(0, 5),
      },
    }));
  },
  removeAddress(address: string) {
    set((s) => ({
      ...s,
      profile: { ...s.profile, addresses: s.profile.addresses.filter((a) => a !== address) },
    }));
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
    const pointsEarned = Math.floor(order.total / 10000) * state.settings.pointsPer10k;
    const full: Order = {
      ...order,
      id: uid(),
      code: "NK-" + Math.floor(1000 + Math.random() * 9000),
      createdAt: Date.now(),
      status: "Pending Payment",
      paid: false,
      pointsEarned,
    };
    set((s) => ({
      ...s,
      orders: [full, ...s.orders],
      cart: [],
      voucherCode: "",
      menu: s.menu.map((m) => {
        if (m.stock === null || m.stock === undefined) return m;
        const ordered = full.lines
          .filter((l) => l.itemId === m.id)
          .reduce((sum, l) => sum + l.qty, 0);
        if (!ordered) return m;
        const stock = Math.max(0, m.stock - ordered);
        return { ...m, stock, available: stock > 0 };
      }),
      profile: { ...s.profile, points: s.profile.points + pointsEarned },
    }));
    return full;
  },
  setOrderStatus(id: string, status: OrderStatus) {
    set((s) => ({
      ...s,
      orders: s.orders.map((o) =>
        o.id === id ? { ...o, status, paid: o.paid || status !== "Pending Payment" } : o,
      ),
    }));
  },
  markPaid(id: string) {
    set((s) => ({
      ...s,
      orders: s.orders.map((o) => (o.id === id ? { ...o, paid: true, status: "Cooking" } : o)),
    }));
  },
  saveMenuItem(item: MenuItem) {
    set((s) => ({
      ...s,
      menu: s.menu.some((m) => m.id === item.id)
        ? s.menu.map((m) => (m.id === item.id ? item : m))
        : [...s.menu, item],
    }));
  },
  deleteMenuItem(id: string) {
    set((s) => ({ ...s, menu: s.menu.filter((m) => m.id !== id) }));
  },
  toggleAvailability(id: string) {
    set((s) => ({
      ...s,
      menu: s.menu.map((m) => (m.id === id ? { ...m, available: !m.available } : m)),
    }));
  },
  setAvailability(id: string, available: boolean) {
    set((s) => ({
      ...s,
      menu: s.menu.map((m) => (m.id === id ? { ...m, available } : m)),
    }));
  },
  setAllAvailability(available: boolean) {
    set((s) => ({ ...s, menu: s.menu.map((m) => ({ ...m, available })) }));
  },
  saveStaff(member: StaffMember) {
    set((s) => ({
      ...s,
      staff: s.staff.some((x) => x.id === member.id)
        ? s.staff.map((x) => (x.id === member.id ? member : x))
        : [...s.staff, member],
    }));
  },
  updateStaff(id: string, patch: Partial<StaffMember>) {
    set((s) => ({
      ...s,
      staff: s.staff.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    }));
  },
  deleteStaff(id: string) {
    set((s) => ({ ...s, staff: s.staff.filter((x) => x.id !== id) }));
  },
  updateSettings(patch: Partial<Settings>) {
    set((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  },
  updateProfile(patch: Partial<Profile>) {
    set((s) => ({ ...s, profile: { ...s.profile, ...patch } }));
  },
  updateCms(patch: Partial<CmsContent>) {
    set((s) => ({ ...s, cms: { ...s.cms, ...patch } }));
  },
  updateCmsAnnouncement(patch: Partial<CmsContent["announcement"]>) {
    set((s) => ({
      ...s,
      cms: {
        ...s.cms,
        announcement: { ...s.cms.announcement, ...patch },
      },
    }));
  },
  updateCmsWelcome(patch: Partial<CmsContent["welcomeScreen"]>) {
    set((s) => ({
      ...s,
      cms: {
        ...s.cms,
        welcomeScreen: { ...s.cms.welcomeScreen, ...patch },
      },
    }));
  },
  updateCmsSocials(patch: Partial<CmsContent["socials"]>) {
    set((s) => ({
      ...s,
      cms: {
        ...s.cms,
        socials: { ...s.cms.socials, ...patch },
      },
    }));
  },
  addCmsFaq(faq: { question: string; answer: string; active?: boolean }) {
    const newFaq: CmsFaq = {
      id: "faq-" + uid(),
      question: faq.question.trim(),
      answer: faq.answer.trim(),
      active: faq.active ?? true,
    };
    set((s) => ({
      ...s,
      cms: {
        ...s.cms,
        faqs: [...s.cms.faqs, newFaq],
      },
    }));
  },
  updateCmsFaq(id: string, patch: Partial<CmsFaq>) {
    set((s) => ({
      ...s,
      cms: {
        ...s.cms,
        faqs: s.cms.faqs.map((f) => (f.id === id ? { ...f, ...patch } : f)),
      },
    }));
  },
  deleteCmsFaq(id: string) {
    set((s) => ({
      ...s,
      cms: {
        ...s.cms,
        faqs: s.cms.faqs.filter((f) => f.id !== id),
      },
    }));
  },
  resetCms() {
    set((s) => ({
      ...s,
      cms: defaultCmsContent,
    }));
  },
};

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function rupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
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
  return Math.max(settings.minFee ?? 0, Math.round(fee / 500) * 500);
}

export function buildWhatsappMessage(order: Order) {
  const lines = order.lines
    .map(
      (l) =>
        `• ${l.qty}x ${l.name}${l.optionLabels.length ? ` (${l.optionLabels.join(", ")})` : ""}${
          l.note ? ` — note: ${l.note}` : ""
        } — ${rupiah(l.unitPrice * l.qty)}`,
    )
    .join("\n");
  return [
    `*New Order ${order.code}* — Nanami Kitchen`,
    `Type: ${order.type === "delivery" ? "Delivery" : "Pickup"}`,
    `Name: ${order.customer.name}`,
    `Phone: ${order.customer.phone}`,
    order.type === "delivery" ? `Address: ${order.customer.address}` : "",
    order.customer.deliveryNote ? `Delivery note: ${order.customer.deliveryNote}` : "",
    "",
    lines,
    "",
    `Subtotal: ${rupiah(order.subtotal)}`,
    order.discount
      ? `Discount${order.voucherCode ? ` (${order.voucherCode})` : ""}: -${rupiah(order.discount)}`
      : "",
    order.deliveryFee ? `Delivery: ${rupiah(order.deliveryFee)}` : "",
    `*Total: ${rupiah(order.total)}*`,
    `Payment: ${order.paymentMethod}`,
    "",
    "I will attach the transfer proof here.",
  ]
    .filter(Boolean)
    .join("\n");
}

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
