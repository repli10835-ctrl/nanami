import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { rupiah, useStore } from "@/lib/store";

export const Route = createFileRoute("/order-success")({
  head: () => ({
    meta: [
      { title: "Order Placed — Nanami Kitchen" },
      {
        name: "description",
        content: "Your Nanami Kitchen order has been placed and sent to WhatsApp.",
      },
      { property: "og:title", content: "Order Placed — Nanami Kitchen" },
      {
        property: "og:description",
        content: "Your order has been sent to WhatsApp.",
      },
    ],
  }),
  component: OrderSuccess,
});

function OrderSuccess() {
  const navigate = useNavigate();
  const order = useStore((s) => s.orders[0]);

  if (!order) {
    return (
      <div className="min-h-screen bg-background px-4 pt-5">
        <div className="shell flex min-h-screen flex-col items-center justify-center pb-10 text-center">
          <p className="text-muted-foreground">No recent order found.</p>
          <Link
            to="/"
            className="mt-4 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 pt-10">
      <div className="shell flex min-h-screen flex-col pb-10">
        {/* Success icon with confetti */}
        <div className="relative flex flex-col items-center pt-8">
          <div className="relative">
            {/* Confetti pieces */}
            <span
              aria-hidden
              className="absolute -left-10 top-2 size-2 rotate-45 rounded-sm bg-primary"
            />
            <span
              aria-hidden
              className="absolute -left-6 -top-4 size-3 rotate-12 rounded-sm bg-[oklch(0.78_0.14_85)]"
            />
            <span
              aria-hidden
              className="absolute -right-8 top-0 size-2 -rotate-12 rounded-full bg-primary"
            />
            <span
              aria-hidden
              className="absolute -right-5 -top-5 size-2.5 rotate-45 rounded-sm bg-[oklch(0.65_0.05_80)]"
            />
            <span
              aria-hidden
              className="absolute -left-8 top-10 size-2 -rotate-45 rounded-full bg-[oklch(0.75_0.12_95)]"
            />
            <span
              aria-hidden
              className="absolute -right-10 top-12 size-2.5 rotate-45 rounded-sm bg-primary/80"
            />
            <span
              aria-hidden
              className="absolute left-1/2 -top-8 size-2 -translate-x-1/2 rotate-12 rounded-sm bg-[oklch(0.7_0.1_90)]"
            />
            <span
              aria-hidden
              className="absolute -left-4 top-16 size-1.5 rotate-45 rounded-full bg-[oklch(0.8_0.1_85)]"
            />
            <span
              aria-hidden
              className="absolute -right-3 top-16 size-1.5 rotate-12 rounded-full bg-primary/70"
            />

            <div className="flex size-28 items-center justify-center rounded-full bg-primary shadow-[0_0_40px_-8px_var(--color-primary)]">
              <Check className="size-14 text-primary-foreground" strokeWidth={3} />
            </div>
          </div>

          <h1 className="mt-8 text-3xl font-bold text-foreground">Order Placed!</h1>
          <p className="mt-3 text-center text-base text-muted-foreground">
            Your order has been sent to WhatsApp.
          </p>
        </div>

        {/* Order summary card */}
        <section className="mt-10 rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <span className="text-base text-muted-foreground">Order No.</span>
            <span className="text-lg font-semibold text-foreground">#{order.code}</span>
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-border pt-5">
            <span className="text-base text-muted-foreground">Total</span>
            <span className="text-2xl font-bold text-foreground">{rupiah(order.total)}</span>
          </div>
        </section>

        {/* Actions */}
        <div className="mt-auto space-y-4 pt-10">
          <button
            onClick={() => navigate({ to: "/orders" })}
            className="w-full rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-[0_8px_24px_-8px_var(--color-primary)]"
          >
            View Order Details
          </button>
          <Link
            to="/"
            className="flex w-full items-center justify-center rounded-2xl border-2 border-primary bg-transparent py-4 text-base font-bold text-foreground transition-colors hover:bg-primary/10"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
