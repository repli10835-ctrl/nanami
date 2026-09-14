import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, MessageSquare } from "lucide-react";
import { buildWhatsappMessage, cleanWhatsappNumber, rupiah, useStore } from "@/lib/store";

export const Route = createFileRoute("/order-success")({
  head: () => ({
    meta: [
      { title: "Order Placed — Nanami Kitchen" },
      {
        name: "description",
        content: "Your order has been placed successfully and sent to the owner's WhatsApp.",
      },
      { property: "og:title", content: "Order Placed — Nanami Kitchen" },
      {
        property: "og:description",
        content: "Your order details have been sent to WhatsApp.",
      },
    ],
  }),
  component: OrderSuccess,
});

function OrderSuccess() {
  const navigate = useNavigate();
  const { order, settings } = useStore((s) => ({
    order: s.orders[0],
    settings: s.settings,
  }));

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

  const targetWa = cleanWhatsappNumber(settings.whatsapp);
  const waUrl = `https://wa.me/${targetWa}?text=${encodeURIComponent(buildWhatsappMessage(order))}`;

  return (
    <div className="min-h-screen bg-background px-4 pt-8">
      <div className="shell flex min-h-screen flex-col pb-10">
        {/* Success icon with confetti */}
        <div className="relative flex flex-col items-center pt-6 text-center">
          <div className="relative">
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

            <div className="flex size-24 sm:size-28 items-center justify-center rounded-full bg-primary shadow-[0_0_40px_-8px_var(--color-primary)]">
              <Check className="size-12 sm:size-14 text-primary-foreground" strokeWidth={3} />
            </div>
          </div>

          <h1 className="mt-6 text-2xl font-bold text-foreground sm:text-3xl">
            Order Successfully Placed!
          </h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-sm">
            Order details and customer information are prepared for the Owner&apos;s WhatsApp (
            <span className="font-semibold text-foreground">+{targetWa}</span>).
          </p>
        </div>

        {/* Order summary card */}
        <section className="mt-6 rounded-3xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Order No.</span>
            <span className="text-base font-bold text-foreground">#{order.code}</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Payment Method</span>
            <span className="text-sm font-semibold text-foreground">{order.paymentMethod}</span>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <span className="text-base text-muted-foreground">Total Amount</span>
            <span className="text-2xl font-bold text-foreground">{rupiah(order.total)}</span>
          </div>
        </section>

        {/* Actions */}
        <div className="mt-auto space-y-3 pt-8">
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,var(--wa),oklch(0.7_0.17_158))] py-3.5 text-sm font-bold text-wa-foreground shadow-[0_8px_24px_-8px_var(--color-wa)] transition hover:brightness-105"
          >
            <MessageSquare className="size-5" />
            Re-open Owner WhatsApp Chat
          </a>
          <button
            onClick={() => navigate({ to: "/orders" })}
            className="w-full rounded-2xl bg-secondary py-3.5 text-sm font-bold text-foreground hover:bg-secondary/80"
          >
            View My Order History
          </button>
          <Link
            to="/"
            className="flex w-full items-center justify-center rounded-2xl border border-border bg-transparent py-3 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
