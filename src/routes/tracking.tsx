import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Bike,
  Check,
  CookingPot,
  MessageCircle,
  PackageCheck,
  Search,
  UtensilsCrossed,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { cleanWhatsappNumber, rupiah, useStore, type Order, type OrderStatus } from "@/lib/store";

export const Route = createFileRoute("/tracking")({
  validateSearch: (search: Record<string, unknown>) => ({
    code: typeof search.code === "string" && search.code ? search.code : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Order Tracking — Nanami Kitchen" },
      {
        name: "description",
        content: "Follow your Nanami Kitchen order step by step, from payment to delivery.",
      },
      { property: "og:title", content: "Order Tracking — Nanami Kitchen" },
      { property: "og:description", content: "Follow your order step by step." },
    ],
  }),
  component: Tracking,
});

const COPY: Record<string, { title: string; body: string }> = {
  "Pending Payment": {
    title: "Waiting for Payment",
    body: "Send your transfer proof on WhatsApp. We start cooking right after the kitchen confirms it.",
  },
  Cooking: {
    title: "Preparing Your Order",
    body: "We've received your payment and are preparing your food.",
  },
  "Ready for Pickup": {
    title: "Ready for Pickup",
    body: "Your order is packed and waiting for you at the kitchen.",
  },
  "Out for Delivery": {
    title: "On the Way",
    body: "Your courier has picked up the order and is heading to your address.",
  },
  Completed: { title: "Order Completed", body: "Enjoy your meal! Thank you for ordering." },
  Cancelled: {
    title: "Order Cancelled",
    body: "This order was cancelled. Contact us on WhatsApp for help.",
  },
};

function stepsFor(order: Order) {
  const delivery = order.type === "delivery";
  return [
    { label: "Order Received", status: "Pending Payment" as OrderStatus, icon: Check },
    { label: "Paid / Cooking", status: "Cooking" as OrderStatus, icon: CookingPot },
    delivery
      ? { label: "Out for Delivery", status: "Out for Delivery" as OrderStatus, icon: Bike }
      : {
          label: "Ready for Pickup",
          status: "Ready for Pickup" as OrderStatus,
          icon: PackageCheck,
        },
    { label: "Completed", status: "Completed" as OrderStatus, icon: Check },
  ];
}

function Tracking() {
  const { code } = Route.useSearch();
  const navigate = useNavigate();
  const [manualCode, setManualCode] = useState(code || "");

  const { orders, profile, settings } = useStore((s) => ({
    orders: s.orders,
    profile: s.profile,
    settings: s.settings,
  }));

  const latest = useMemo(() => {
    if (code) {
      const matched = orders.find((o) => o.code.trim().toUpperCase() === code.trim().toUpperCase());
      if (matched) return matched;
    }
    return orders[0] ?? null;
  }, [orders, code]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!manualCode.trim()) return;
    navigate({
      search: { code: manualCode.trim().toUpperCase() },
    });
  }

  if (!latest) {
    return (
      <AppShell hideCartBar>
        <div className="py-16 text-center max-w-sm mx-auto">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
            <Search className="size-7" />
          </div>
          <h1 className="mt-4 text-xl font-bold">Track Order Status</h1>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {code
              ? `No order found with code "${code}". Please verify your order code.`
              : "Enter your order code to check real-time kitchen preparation and delivery progress."}
          </p>

          <form onSubmit={handleSearchSubmit} className="mt-6 flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="e.g. NK-4821"
              className="flex-1 rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm uppercase font-mono tracking-wider outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-95"
            >
              Track
            </button>
          </form>

          <div className="mt-8 flex flex-col gap-2">
            <Link
              to="/menu"
              className="inline-block rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
            >
              Browse Menu & Order
            </Link>
            <Link
              to="/"
              className="inline-block rounded-full border border-border bg-secondary/30 px-6 py-2.5 text-xs font-semibold text-foreground hover:bg-secondary/60"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const steps = stepsFor(latest);
  const statusIndex = Math.max(
    0,
    steps.findIndex((s) => s.status === latest.status),
  );
  const copy = COPY[latest.status] ?? COPY["Cooking"]!;
  const placed = new Date(latest.createdAt);
  const eta = new Date(latest.createdAt + latest.etaMinutes * 60000);
  const targetWa = cleanWhatsappNumber(settings.whatsapp);

  return (
    <AppShell hideCartBar>
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <Link
            to={profile.signedIn ? "/orders" : "/"}
            aria-label="Back"
            className="rounded-full p-1 text-foreground hover:bg-secondary/50"
          >
            <ArrowLeft className="size-6" strokeWidth={2.4} />
          </Link>
          <h1 className="text-xl font-bold">Order Tracking</h1>
        </div>

        <a
          href={`https://wa.me/${targetWa}?text=${encodeURIComponent(`Hi Nanami Kitchen, I would like to inquire about my order #${latest.code}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
        >
          <MessageCircle className="size-3.5" /> WhatsApp Kitchen
        </a>
      </div>

      <div className="glow-card mt-5 flex items-center gap-4 border-primary/40 p-4">
        <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary shadow-[0_8px_24px_-8px] shadow-primary/50 text-primary-foreground">
          <UtensilsCrossed className="size-7" strokeWidth={2.2} />
        </div>
        <div>
          <p className="text-base font-bold">{copy.title}</p>
          <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{copy.body}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl border border-border bg-card p-3.5 text-sm shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-foreground">#{latest.code}</span>
            <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-semibold capitalize text-secondary-foreground">
              {latest.type}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Ordered at {placed.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold text-primary">{rupiah(latest.total)}</p>
          <p className="text-xs text-muted-foreground">
            ETA {eta.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>

      <ol className="mt-7 space-y-1">
        {steps.map((step, i) => {
          const done = i <= statusIndex;
          const current = i === statusIndex;
          const last = i === steps.length - 1;
          const Icon = step.icon;
          return (
            <li key={step.label} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={
                    done
                      ? "grid size-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm shadow-primary/60"
                      : "grid size-9 place-items-center rounded-full border-2 border-muted text-muted-foreground"
                  }
                >
                  {done && !current ? (
                    <Check className="size-4" strokeWidth={3} />
                  ) : (
                    <Icon className="size-4" strokeWidth={2.4} />
                  )}
                </div>
                {!last && (
                  <div
                    className={
                      i < statusIndex
                        ? "h-8 w-0.5 bg-primary"
                        : "h-8 w-0.5 border-l-2 border-dashed border-muted"
                    }
                  />
                )}
              </div>
              <div className="pt-1">
                <p
                  className={
                    done
                      ? "text-base font-bold text-foreground"
                      : "text-base font-bold text-muted-foreground/50"
                  }
                >
                  {step.label}
                </p>
                {current && <p className="mt-0.5 text-xs text-primary font-medium">In Progress</p>}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Guest or Member CTA */}
      <div className="mt-8 flex flex-col gap-2.5">
        {profile.signedIn ? (
          <Link
            to="/orders"
            className="block rounded-full bg-primary py-3.5 text-center text-sm font-bold text-primary-foreground shadow-md transition hover:opacity-95"
          >
            View All My Orders
          </Link>
        ) : (
          <Link
            to="/"
            className="block rounded-full bg-primary py-3.5 text-center text-sm font-bold text-primary-foreground shadow-md transition hover:opacity-95"
          >
            Return to Storefront
          </Link>
        )}

        <form onSubmit={handleSearchSubmit} className="mt-2 flex gap-2 border-t border-border pt-4">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Track another order code..."
            className="flex-1 rounded-xl border border-input bg-card px-3 py-2 text-xs uppercase font-mono outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="rounded-xl border border-border bg-secondary/50 px-3.5 py-2 text-xs font-semibold hover:bg-secondary"
          >
            Find
          </button>
        </form>
      </div>
    </AppShell>
  );
}
