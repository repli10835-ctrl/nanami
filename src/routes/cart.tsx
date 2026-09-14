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
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate({ to: "/menu" })}
          aria-label="Back to menu"
          className="flex size-10 items-center justify-center rounded-full bg-card text-foreground"
        >
          <ChevronLeft className="size-5" />
        </button>
        <h1 className="text-xl font-bold">My Cart</h1>
        <button
          onClick={() => actions.clearCart()}
          aria-label="Clear cart"
          className="flex size-10 items-center justify-center rounded-full text-foreground"
        >
          <Trash2 className="size-5" />
        </button>
      </div>

      {/* Cart items */}
      <div className="mt-5 space-y-3">
        {cart.map((l) => (
          <div key={l.id} className="flex gap-4 rounded-2xl border border-border bg-card p-4">
            {imageFor(l.itemId) && (
              <img
                src={imageFor(l.itemId)}
                alt={l.name}
                className="size-20 shrink-0 self-center rounded-xl object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{l.name}</p>
              {l.optionLabels.length > 0 && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {l.optionLabels.join(" - ")}
                </p>
              )}
              {l.note && <p className="text-xs text-muted-foreground">Note: {l.note}</p>}
              <p className="mt-1 text-sm text-muted-foreground">{rupiah(l.unitPrice)}</p>
              <div className="mt-2 inline-flex items-center overflow-hidden rounded-lg border border-border">
                <button
                  onClick={() => actions.setQty(l.id, l.qty - 1)}
                  aria-label="Decrease quantity"
                  className="flex size-8 items-center justify-center"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-10 border-x border-border py-1 text-center text-sm font-semibold">
                  {l.qty}
                </span>
                <button
                  onClick={() => actions.setQty(l.id, l.qty + 1)}
                  aria-label="Increase quantity"
                  className="flex size-8 items-center justify-center"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>
            <button
              onClick={() => actions.setQty(l.id, 0)}
              aria-label={`Remove ${l.name}`}
              className="self-end pb-1 text-muted-foreground"
            >
              <Trash2 className="size-5" />
            </button>
          </div>
        ))}
        {cart.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Your cart is empty.{" "}
            <Link to="/menu" className="text-primary">
              Browse the menu
            </Link>
          </p>
        )}
      </div>

      {cart.length > 0 && (
        <>
          {/* Totals */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">{rupiah(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span className="text-muted-foreground">
                {deliveryFee > 0 ? rupiah(deliveryFee) : "Free"}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Voucher ({voucherCode})</span>
                <span className="font-semibold text-primary">-{rupiah(discount)}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 text-base">
              <span className="font-bold">Total</span>
              <span className="text-xl font-bold">{rupiah(total)}</span>
            </div>
          </div>

          {/* Voucher */}
          <div className="mt-4 rounded-2xl border border-border bg-card">
            <button
              onClick={() => setVoucherOpen((o) => !o)}
              className="flex w-full items-center justify-between px-4 py-3.5 text-sm text-muted-foreground"
            >
              Have a voucher code?
              <ChevronDown
                className={`size-4 transition-transform ${voucherOpen ? "rotate-180" : ""}`}
              />
            </button>
            {voucherOpen && (
              <div className="flex gap-2 px-4 pb-4">
                <input
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="e.g. NANAMI20"
                  className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm uppercase outline-none"
                />
                <button
                  onClick={() => actions.setVoucherCode(codeInput)}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {!settings.storeOpen && (
            <p className="mt-3 rounded-lg bg-destructive/15 px-3 py-2 text-xs text-destructive">
              The store is currently closed. Checkout is disabled.
            </p>
          )}
          {settings.storeOpen && serviceOff && (
            <p className="mt-3 rounded-lg bg-destructive/15 px-3 py-2 text-xs text-destructive">
              {orderType} service is temporarily unavailable.
            </p>
          )}

          {blocked ? (
            <button
              disabled
              className="mt-4 w-full rounded-full bg-muted py-3.5 text-sm font-bold text-muted-foreground"
            >
              Checkout unavailable
            </button>
          ) : (
            <Link
              to="/checkout"
              className="mt-4 block w-full rounded-full bg-primary py-3.5 text-center text-sm font-bold text-primary-foreground"
            >
              Checkout
            </Link>
          )}
        </>
      )}
    </AppShell>
  );
}
