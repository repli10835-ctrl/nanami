import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  CupSoda,
  Cookie,
  HelpCircle,
  Info,
  Instagram,
  MessageCircle,
  Plus,
  Salad,
  Search,
  ShoppingBasket,
  Sparkles,
  Tag,
  UtensilsCrossed,
} from "lucide-react";
import defaultLogo from "@/assets/nanami-logo.png";
import { AppShell } from "@/components/AppShell";
import { InstallPrompt } from "@/components/InstallPrompt";
import { PromoCarousel } from "@/components/PromoCarousel";
import { ProductSheet } from "@/components/ProductSheet";
import {
  actions,
  CATEGORIES,
  defaultCmsContent,
  rupiah,
  useStore,
  type MenuItem,
} from "@/lib/store";

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

let welcomeScreenSeen = false;

function Home() {
  const { orderType, menu, settings, cms } = useStore((s) => ({
    orderType: s.orderType,
    menu: s.menu,
    settings: s.settings,
    cms: s.cms || defaultCmsContent,
  }));
  const [active, setActive] = useState<MenuItem | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const popular = menu.filter((m) => m.available).slice(0, 4);

  const displayLogo = cms.logoUrl || defaultLogo;
  const brandName = cms.brandName || "nanami";
  const brandSuffix = cms.brandSuffix || "kitchen";
  const activeFaqs = (cms.faqs || []).filter((f) => f.active);

  useEffect(() => {
    if (cms.welcomeScreen?.enabled === false) return;
    if (welcomeScreenSeen) return;
    welcomeScreenSeen = true;
    setShowWelcome(true);
  }, [cms.welcomeScreen?.enabled]);

  return (
    <AppShell>
      {showWelcome && <WelcomeScreen onDone={() => setShowWelcome(false)} />}

      {/* Dynamic Running Announcement Bar */}
      {cms.announcement?.enabled && cms.announcement.text && (
        <div
          className={`-mt-0.5 mb-2 flex items-center justify-between gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold shadow-xs transition ${
            cms.announcement.type === "promo"
              ? "border border-amber-500/30 bg-amber-500/15 text-amber-900 dark:text-amber-200"
              : cms.announcement.type === "warning"
                ? "border border-destructive/30 bg-destructive/15 text-destructive"
                : "border border-primary/30 bg-primary/10 text-primary"
          }`}
        >
          <div className="flex items-center gap-1.5 truncate">
            {cms.announcement.type === "warning" ? (
              <AlertCircle className="size-3.5 shrink-0" />
            ) : cms.announcement.type === "info" ? (
              <Info className="size-3.5 shrink-0" />
            ) : (
              <Sparkles className="size-3.5 shrink-0" />
            )}
            <span className="truncate">{cms.announcement.text}</span>
          </div>
          {cms.announcement.link && (
            <Link
              to={cms.announcement.link}
              className="shrink-0 text-[11px] underline hover:opacity-80"
            >
              Lihat &rarr;
            </Link>
          )}
        </div>
      )}

      <header className="flex items-center justify-between py-0.5">
        <div className="flex items-center gap-2">
          <img
            src={displayLogo}
            alt={`${brandName} ${brandSuffix} logo`}
            width={36}
            height={36}
            className="size-9 rounded-lg object-contain"
          />
          <div className="leading-none">
            <h1 className="font-display text-2xl italic text-primary">{brandName}</h1>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.35em] text-primary/80">
              {brandSuffix}
            </p>
          </div>
        </div>
        <Link
          to="/orders"
          aria-label="My orders"
          className="rounded-lg border border-border p-1.5 text-foreground hover:bg-secondary/40 transition"
        >
          <ShoppingBasket className="size-4" />
        </Link>
      </header>

      <PromoCarousel />

      <Link
        to="/menu"
        className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground transition hover:bg-secondary/60"
      >
        <Search className="size-3.5" /> Search menu...
      </Link>

      <section className="mt-2.5">
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-0.5">
          {CATEGORIES.map((c, i) => {
            const Icon = CATEGORY_ICONS[c] ?? Tag;
            return (
              <Link
                key={c}
                to="/menu"
                search={{ category: c }}
                className={`flex w-[70px] sm:w-[78px] shrink-0 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-semibold transition ${
                  i === 0
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "border border-border bg-secondary/40 text-foreground hover:bg-secondary/70"
                }`}
              >
                <Icon className="size-4.5" />
                <span className="truncate">{c}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold">Popular Menu</h2>
          <Link to="/menu" className="text-xs font-semibold text-primary hover:underline">
            See all
          </Link>
        </div>
        <div className="mt-1.5 grid grid-cols-2 gap-2">
          {popular.map((m) => (
            <div key={m.id} className="glow-card overflow-hidden rounded-xl">
              <button onClick={() => setActive(m)} className="block w-full text-left">
                <div className="p-1 pb-0">
                  <img
                    src={m.image}
                    alt={m.name}
                    loading="lazy"
                    className="h-22 sm:h-24 w-full rounded-lg object-cover"
                  />
                </div>
                <div className="px-2 pt-1.5">
                  <p className="line-clamp-1 text-xs font-bold">{m.name}</p>
                  <p className="text-xs font-semibold text-primary">{rupiah(m.price)}</p>
                </div>
              </button>
              <div className="flex justify-end px-2 pb-2 pt-1">
                <button
                  aria-label={`Add ${m.name} to cart`}
                  onClick={() => setActive(m)}
                  className="rounded-md bg-primary p-1 text-primary-foreground transition hover:brightness-105 active:scale-95"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-2.5 flex items-center justify-between rounded-lg border border-border px-2.5 py-1.5 text-xs">
        <div className="flex rounded-lg bg-secondary/60 p-0.5">
          {(["pickup", "delivery"] as const).map((t) => (
            <button
              key={t}
              onClick={() => actions.setOrderType(t)}
              disabled={t === "delivery" ? !settings.deliveryOn : !settings.pickupOn}
              className={`rounded-md px-3 py-1 text-[11px] font-bold capitalize transition disabled:opacity-40 ${
                orderType === t ? "bg-primary text-primary-foreground shadow-xs" : "text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
            settings.storeOpen ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
          }`}
        >
          {settings.storeOpen ? "Open now" : "Closed"}
        </span>
      </div>
      <p className="mt-1 text-center text-[11px] text-muted-foreground">
        Hours: {settings.openHours}
      </p>

      {/* FAQ Accordion Section */}
      {activeFaqs.length > 0 && (
        <section className="mt-3 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="size-3.5 text-primary" />
            <h3 className="text-xs font-bold text-foreground">Pertanyaan Umum (FAQ)</h3>
          </div>
          <div className="space-y-1.5">
            {activeFaqs.map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className="overflow-hidden rounded-lg border border-border bg-card transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                    className="flex w-full items-center justify-between p-2.5 text-left text-[11px] font-semibold text-foreground hover:bg-secondary/40"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="size-3.5 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="border-t border-border bg-secondary/20 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* About & Socials in footer */}
      {cms.aboutStory && (
        <section className="mt-3 rounded-xl border border-border/80 bg-secondary/20 p-2.5 text-center">
          <p className="font-display text-sm italic text-primary">
            {brandName} {brandSuffix}
          </p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
            {cms.aboutStory}
          </p>
        </section>
      )}

      <a
        href={`https://wa.me/${cms.socials?.whatsapp?.replace(/\D/g, "") || settings.whatsapp}`}
        target="_blank"
        rel="noreferrer"
        className="mt-2 flex items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-xs font-semibold transition hover:bg-secondary/40"
      >
        <MessageCircle className="size-3.5 text-primary" /> Chat with us on WhatsApp
      </a>

      <InstallPrompt />
      {active && <ProductSheet item={active} onClose={() => setActive(null)} />}
    </AppShell>
  );
}
