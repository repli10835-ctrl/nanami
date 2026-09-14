import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Sparkles, Ticket } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { actions, cartTotals, discountFor, findVoucher, rupiah, useStore } from "@/lib/store";

export const Route = createFileRoute("/vouchers")({
  head: () => ({
    meta: [
      { title: "Vouchers & Promo — Nanami Kitchen" },
      {
        name: "description",
        content: "Apply promo codes and browse available Nanami Kitchen vouchers.",
      },
      { property: "og:title", content: "Vouchers & Promo — Nanami Kitchen" },
      { property: "og:description", content: "Apply promo codes and browse available vouchers." },
    ],
  }),
  component: Vouchers,
});

function Vouchers() {
  const { vouchers, voucherCode, cart, profile, settings } = useStore((s) => ({
    vouchers: s.vouchers,
    voucherCode: s.voucherCode,
    cart: s.cart,
    profile: s.profile,
    settings: s.settings,
  }));
  const { subtotal } = cartTotals(cart);
  const [code, setCode] = useState(voucherCode);
  const [error, setError] = useState("");

  const active = vouchers.filter((v) => v.active);

  function apply(value: string) {
    const voucher = findVoucher(vouchers, value);
    if (!voucher) {
      setError("That voucher code is not valid.");
      return;
    }
    if (subtotal > 0 && subtotal < voucher.minSpend) {
      setError(`Minimum spend for this voucher is ${rupiah(voucher.minSpend)}.`);
      return;
    }
    setError("");
    setCode(voucher.code);
    actions.setVoucherCode(voucher.code);
  }

  return (
    <AppShell hideCartBar>
      <div className="flex items-center gap-4 pt-2">
        <Link to="/profile" aria-label="Back" className="rounded-full p-1 text-foreground">
          <ArrowLeft className="size-6" />
        </Link>
        <h1 className="text-2xl font-bold">Vouchers & Promo</h1>
      </div>

      <div className="glow-card mt-6 flex items-center gap-3 p-4">
        <Sparkles className="size-5 shrink-0 text-primary" />
        <div>
          <p className="text-sm font-semibold">{profile.points} loyalty points</p>
          <p className="text-xs text-muted-foreground">
            Earn {settings.pointsPer10k} point for every R 100 you spend.
          </p>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter promo code"
          className="min-w-0 flex-1 rounded-xl border border-input bg-secondary/40 px-3 py-2.5 text-sm uppercase outline-none focus:border-primary"
        />
        <button
          onClick={() => apply(code)}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
        >
          Apply
        </button>
      </div>
      {error && (
        <p className="mt-3 rounded-lg bg-destructive/15 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      )}
      {voucherCode && !error && (
        <p className="mt-3 flex items-center gap-2 rounded-lg bg-success/15 px-3 py-2 text-xs text-success">
          <Check className="size-3.5" /> {voucherCode} is applied to your cart
          {subtotal > 0 &&
            ` — you save ${rupiah(discountFor(subtotal, findVoucher(vouchers, voucherCode)))}`}
        </p>
      )}

      <h2 className="mt-7 text-lg font-semibold">Available vouchers</h2>
      <div className="mt-3 space-y-3">
        {active.length === 0 && (
          <p className="text-sm text-muted-foreground">No vouchers available right now.</p>
        )}
        {active.map((v) => (
          <div key={v.code} className="glow-card flex items-center gap-4 p-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary">
              <Ticket className="size-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">
                {v.type === "percent" ? `${v.value}% OFF` : `${rupiah(v.value)} OFF`}
              </p>
              <p className="text-xs text-muted-foreground">
                Code {v.code}
                {v.minSpend > 0 ? ` · min. spend ${rupiah(v.minSpend)}` : " · no minimum"}
              </p>
            </div>
            <button
              onClick={() => apply(v.code)}
              className={`rounded-full px-4 py-2 text-xs font-bold ${
                voucherCode === v.code
                  ? "bg-success/15 text-success"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {voucherCode === v.code ? "Applied" : "Use"}
            </button>
          </div>
        ))}
      </div>

      <Link
        to="/cart"
        className="mt-7 block rounded-full bg-primary py-3.5 text-center text-sm font-bold text-primary-foreground"
      >
        Back to cart
      </Link>
    </AppShell>
  );
}
