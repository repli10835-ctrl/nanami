import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, ChevronLeft, Minus, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { actions, cartTotals, deliveryFeeFor, rupiah, useStore } from "@/lib/store";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "My Cart — Nanami Kitchen" },
      { name: "description", content: "Review your Nanami Kitchen order before checkout." },
      { property: "og:title", content: "My Cart — Nanami Kitchen" },
      { property: "og:description", content: "Review your order before checkout." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const navigate = useNavigate();
  const { cart, orderType, settings, menu, vouchers, voucherCode, distanceKm } = useStore((s) => ({
    cart: s.cart,
    orderType: s.orderType,
    settings: s.settings,
    menu: s.menu,
    vouchers: s.vouchers,
    voucherCode: s.voucherCode,
    distanceKm: s.distanceKm,
  }));
  const { subtotal } = cartTotals(cart);
  const deliveryFee =
    cart.length > 0 ? deliveryFeeFor(settings, orderType, distanceKm, subtotal) : 0;
  const voucher = vouchers.find((v) => v.code === voucherCode && v.active);
  const discount =
    voucher && subtotal >= voucher.minSpend
      ? voucher.type === "percent"
        ? Math.round((subtotal * voucher.value) / 100)
        : voucher.value
      : 0;
  const total = Math.max(0, subtotal + deliveryFee - discount);
  const serviceOff = orderType === "delivery" ? !settings.deliveryOn : !settings.pickupOn;
  const blocked = !settings.storeOpen || serviceOff || cart.length === 0;

  const [voucherOpen, setVoucherOpen] = useState(false);
  const [codeInput, setCodeInput] = useState(voucherCode);

  const imageFor = (itemId: string) => menu.find((m) => m.id === itemId)?.image;

  return (
    <AppShell hideCartBar>
      {/* Header */}
      <div className="flex items-center justify-between py-0.5">
        <button
          onClick={() => navigate({ to: "/menu" })}
          aria-label="Back to menu"
          className="flex size-8 items-center justify-center rounded-lg bg-card text-foreground transition hover:bg-secondary/40"
        >
          <ChevronLeft className="size-4" />
        </button>
        <h1 className="text-lg font-bold">My Cart</h1>
        <button
          onClick={() => actions.clearCart()}
          aria-label="Clear cart"
          className="flex size-8 items-center justify-center rounded-lg text-foreground hover:bg-secondary/40 transition"
        >
          <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
        </button>
      </div>

      {/* Cart items */}
      <div className="mt-2 space-y-1.5">
        {cart.map((l) => (
          <div key={l.id} className="flex gap-2.5 rounded-xl border border-border bg-card p-2.5">
            {imageFor(l.itemId) && (
              <img
                src={imageFor(l.itemId)}
                alt={l.name}
                className="size-16 shrink-0 self-center rounded-lg object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold">{l.name}</p>
              {l.optionLabels.length > 0 && (
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {l.optionLabels.join(" - ")}
                </p>
              )}
              {l.note && <p className="text-[10px] text-muted-foreground">Note: {l.note}</p>}
              <p className="mt-0.5 text-xs font-semibold text-primary">{rupiah(l.unitPrice)}</p>
              <div className="mt-1.5 inline-flex items-center overflow-hidden rounded-md border border-border">
                <button
                  onClick={() => actions.setQty(l.id, l.qty - 1)}
                  aria-label="Decrease quantity"
                  className="flex size-6 items-center justify-center hover:bg-secondary/40"
                >
                  <Minus className="size-3" />
                </button>
                <span className="w-8 border-x border-border py-0.5 text-center text-xs font-bold">
                  {l.qty}
                </span>
                <button
                  onClick={() => actions.setQty(l.id, l.qty + 1)}
                  aria-label="Increase quantity"
                  className="flex size-6 items-center justify-center hover:bg-secondary/40"
                >
                  <Plus className="size-3" />
                </button>
              </div>
            </div>
            <button
              onClick={() => actions.setQty(l.id, 0)}
              aria-label={`Remove ${l.name}`}
              className="self-end pb-0.5 text-muted-foreground hover:text-destructive transition"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
        {cart.length === 0 && (
          <p className="py-8 text-center text-xs text-muted-foreground">
            Your cart is empty.{" "}
            <Link to="/menu" className="text-primary font-semibold hover:underline">
              Browse the menu
            </Link>
          </p>
        )}
      </div>

      {cart.length > 0 && (
        <>
          {/* Totals */}
          <div className="mt-3 space-y-1 rounded-xl border border-border bg-card p-2.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">{rupiah(subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span className="text-muted-foreground">
                {deliveryFee > 0 ? rupiah(deliveryFee) : "Free"}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Voucher ({voucherCode})</span>
                <span className="font-semibold text-primary">-{rupiah(discount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-1 text-xs">
              <span className="font-bold">Total</span>
              <span className="text-sm font-extrabold text-primary">{rupiah(total)}</span>
            </div>
          </div>

          {/* Voucher */}
          <div className="mt-2 rounded-xl border border-border bg-card">
            <button
              onClick={() => setVoucherOpen((o) => !o)}
              className="flex w-full items-center justify-between px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <span>Have a voucher code?</span>
              <ChevronDown
                className={`size-3.5 transition-transform ${voucherOpen ? "rotate-180" : ""}`}
              />
            </button>
            {voucherOpen && (
              <div className="flex gap-1.5 px-3 pb-2.5">
                <input
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="e.g. NANAMI20"
                  className="min-w-0 flex-1 rounded-lg border border-border bg-background px-2.5 py-1 text-xs uppercase outline-none"
                />
                <button
                  onClick={() => actions.setVoucherCode(codeInput)}
                  className="rounded-lg bg-primary px-3 py-1 text-xs font-bold text-primary-foreground transition hover:brightness-105"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {!settings.storeOpen && (
            <p className="mt-2 rounded-lg bg-destructive/15 px-2.5 py-1.5 text-[11px] text-destructive">
              The store is currently closed. Checkout is disabled.
            </p>
          )}
          {settings.storeOpen && serviceOff && (
            <p className="mt-2 rounded-lg bg-destructive/15 px-2.5 py-1.5 text-[11px] text-destructive">
              {orderType} service is temporarily unavailable.
            </p>
          )}

          {blocked ? (
            <button
              disabled
              className="mt-2.5 w-full rounded-xl bg-muted py-2.5 text-xs font-bold text-muted-foreground"
            >
              Checkout unavailable
            </button>
          ) : (
            <Link
              to="/checkout"
              className="mt-2.5 block w-full rounded-xl bg-primary py-2.5 text-center text-xs font-bold text-primary-foreground transition hover:brightness-105"
            >
              Checkout &rarr;
            </Link>
          )}
        </>
      )}
    </AppShell>
  );
}
