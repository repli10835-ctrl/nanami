import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import {
  CupSoda,
  Cookie,
  MessageCircle,
  Plus,
  Salad,
  Search,
  ShoppingBasket,
  Tag,
  UtensilsCrossed,
} from "lucide-react";
import logo from "@/assets/nanami-logo.png";
import { AppShell } from "@/components/AppShell";
import { InstallPrompt } from "@/components/InstallPrompt";
import { PromoCarousel } from "@/components/PromoCarousel";
import { ProductSheet } from "@/components/ProductSheet";
import { actions, CATEGORIES, rupiah, useStore, type MenuItem } from "@/lib/store";

const CATEGORY_ICONS = {
  Foods: UtensilsCrossed,
  Snacks: Cookie,
  Drinks: CupSoda,
  Combos: Salad,
  Others: Tag,
} as const;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nanami Kitchen — Order Food Delivery & Pickup" },
      {
        name: "description",
        content:
          "Order Nanami Kitchen bento, geprek, snacks and drinks. Fast pickup or delivery with easy WhatsApp checkout.",
      },
      { property: "og:title", content: "Nanami Kitchen — Order Food Delivery & Pickup" },
      {
        property: "og:description",
        content: "Good food, made with love. Order in seconds for pickup or delivery.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { orderType, menu, settings } = useStore((s) => ({
    orderType: s.orderType,
    menu: s.menu,
    settings: s.settings,
  }));
  const [active, setActive] = useState<MenuItem | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const popular = menu.filter((m) => m.available).slice(0, 4);

  useEffect(() => {
    if (sessionStorage.getItem("nanami-welcome-seen")) return;
    sessionStorage.setItem("nanami-welcome-seen", "1");
    setShowWelcome(true);
  }, []);

  return (
    <AppShell>
      {showWelcome && <WelcomeScreen onDone={() => setShowWelcome(false)} />}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Nanami Kitchen logo" width={44} height={44} className="size-11" />
          <div className="leading-none">
            <h1 className="font-display text-3xl italic text-primary">nanami</h1>
            <p className="mt-1 text-xs uppercase tracking-[0.45em] text-primary/80">kitchen</p>
          </div>
        </div>
        <Link
          to="/orders"
          aria-label="My orders"
          className="rounded-xl border border-border p-2 text-foreground"
        >
          <ShoppingBasket className="size-5" />
        </Link>
      </header>

      <PromoCarousel />

      <Link
        to="/menu"
        className="mt-4 flex items-center gap-3 rounded-full border border-border bg-secondary/40 px-4 py-3 text-sm text-muted-foreground"
      >
        <Search className="size-4" /> Search menu...
      </Link>

      <section className="mt-5">
        <div className="no-scrollbar flex gap-3 overflow-x-auto">
          {CATEGORIES.map((c, i) => {
            const Icon = CATEGORY_ICONS[c] ?? Tag;
            return (
              <Link
                key={c}
                to="/menu"
                search={{ category: c }}
                className={`flex w-[88px] shrink-0 flex-col items-center gap-2 rounded-2xl px-3 py-3 text-xs font-semibold ${
                  i === 0
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-secondary/40 text-foreground"
                }`}
              >
                <Icon className="size-6" />
                {c}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Popular Menu</h2>
          <Link to="/menu" className="text-xs text-primary">
            See all
          </Link>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {popular.map((m) => (
            <div key={m.id} className="glow-card overflow-hidden">
              <button onClick={() => setActive(m)} className="block w-full text-left">
                <div className="p-2 pb-0">
                  <img
                    src={m.image}
                    alt={m.name}
                    loading="lazy"
                    className="h-28 w-full rounded-xl object-cover"
                  />
                </div>
                <div className="px-3 pt-2">
                  <p className="line-clamp-1 text-sm font-semibold">{m.name}</p>
                  <p className="text-sm text-muted-foreground">{rupiah(m.price)}</p>
                </div>
              </button>
              <div className="flex justify-end px-3 pb-3 pt-2">
                <button
                  aria-label={`Add ${m.name} to cart`}
                  onClick={() => setActive(m)}
                  className="rounded-lg bg-primary p-1.5 text-primary-foreground"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6 flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm">
        <div className="flex rounded-full bg-secondary/60 p-1">
          {(["pickup", "delivery"] as const).map((t) => (
            <button
              key={t}
              onClick={() => actions.setOrderType(t)}
              disabled={t === "delivery" ? !settings.deliveryOn : !settings.pickupOn}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize disabled:opacity-40 ${
                orderType === t ? "bg-primary text-primary-foreground" : "text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            settings.storeOpen ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
          }`}
        >
          {settings.storeOpen ? "Open now" : "Closed"}
        </span>
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Opening hours: {settings.openHours}
      </p>

      <a
        href={`https://wa.me/${settings.whatsapp}`}
        target="_blank"
        rel="noreferrer"
        className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-medium"
      >
        <MessageCircle className="size-4 text-primary" /> Chat with us on WhatsApp
      </a>

      <InstallPrompt />
      {active && <ProductSheet item={active} onClose={() => setActive(null)} />}
    </AppShell>
  );
}
