import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Bike, Check, CookingPot, PackageCheck, UtensilsCrossed } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { rupiah, useStore, type Order, type OrderStatus } from "@/lib/store";

export const Route = createFileRoute("/tracking")({
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
  Cancelled: { title: "Order Cancelled", body: "This order was cancelled. Contact us on WhatsApp for help." },
};

function stepsFor(order: Order) {
  const delivery = order.type === "delivery";
  return [
    { label: "Order Received", status: "Pending Payment" as OrderStatus, icon: Check },
    { label: "Paid / Cooking", status: "Cooking" as OrderStatus, icon: CookingPot },
    delivery
      ? { label: "Out for Delivery", status: "Out for Delivery" as OrderStatus, icon: Bike }
      : { label: "Ready for Pickup", status: "Ready for Pickup" as OrderStatus, icon: PackageCheck },
    { label: "Completed", status: "Completed" as OrderStatus, icon: Check },
  ];
}

function Tracking() {
  const orders = useStore((s) => s.orders);
  const latest = orders[0];

  if (!latest) {
    return (
      <AppShell hideCartBar>
        <div className="py-20 text-center">
          <h1 className="text-xl font-bold">No order to track</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Place an order and its live status will appear here.
          </p>
          <Link
            to="/menu"
            className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
          >
            Browse the menu
          </Link>
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

  return (
    <AppShell hideCartBar>
      <div className="flex items-center gap-4 pt-2">
        <Link to="/orders" aria-label="Back" className="rounded-full p-1 text-foreground">
          <ArrowLeft className="size-7" strokeWidth={2.4} />
        </Link>
        <h1 className="text-2xl font-bold">Order Tracking</h1>
      </div>

      <div className="glow-card mt-6 flex items-center gap-4 border-primary/40 p-4">
        <div className="grid size-16 shrink-0 place-items-center rounded-full bg-primary shadow-[0_8px_24px_-8px] shadow-primary/50">
          <UtensilsCrossed className="size-8 text-primary-foreground" strokeWidth={2.2} />
        </div>
        <div>
          <p className="text-lg font-bold">{copy.title}</p>
          <p className="mt-1 text-sm leading-snug text-muted-foreground">{copy.body}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl border border-border px-4 py-3 text-sm">
        <div>
          <p className="font-bold">{latest.code}</p>
          <p className="text-xs capitalize text-muted-foreground">
            {latest.type} · {placed.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold">{rupiah(latest.total)}</p>
          <p className="text-xs text-muted-foreground">
            ETA {eta.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>

      <ol className="mt-8">
        {steps.map((step, i) => {
          const done = i <= statusIndex;
          const current = i === statusIndex;
          const last = i === steps.length - 1;
          const Icon = step.icon;
          return (
            <li key={step.label} className="flex gap-5">
              <div className="flex flex-col items-center">
                <div
                  className={
                    done
                      ? "grid size-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_6px_18px_-6px] shadow-primary/60"
                      : "grid size-10 place-items-center rounded-full border-2 border-muted text-muted-foreground"
                  }
                >
                  {done && !current ? (
                    <Check className="size-5" strokeWidth={3} />
                  ) : (
                    <Icon className="size-5" strokeWidth={2.4} />
                  )}
                </div>
                {!last && (
                  <div
                    className={
                      i < statusIndex
                        ? "h-9 w-0.5 bg-primary"
                        : "h-9 w-0.5 border-l-2 border-dashed border-muted"
                    }
                  />
                )}
              </div>
              <div className="pt-1.5">
                <p
                  className={
                    done
                      ? "text-lg font-bold text-foreground"
                      : "text-lg font-bold text-muted-foreground/50"
                  }
                >
                  {step.label}
                </p>
                {current && (
                  <p className="mt-0.5 text-sm text-muted-foreground">Current status</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <Link
        to="/orders"
        className="mt-10 block rounded-full bg-primary py-4 text-center text-lg font-bold text-primary-foreground shadow-[0_12px_32px_-10px] shadow-primary/50 transition-transform active:scale-[0.98]"
      >
        View Order Details
      </Link>
    </AppShell>
  );
}
