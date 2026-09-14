import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Banknote, Check, Copy, Landmark, MapPin, Wallet } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  actions,
  buildWhatsappMessage,
  cartTotals,
  deliveryFeeFor,
  discountFor,
  findVoucher,
  rupiah,
  useStore,
} from "@/lib/store";
import mapImg from "@/assets/checkout-map.jpg";

const PAYMENT_OPTIONS = [
  {
    id: "ewallet",
    label: "E-Wallet",
    sub: "(GoPay, OVO, Dana, ShopeePay)",
    icon: Wallet,
    badges: [
      { text: "GP", bg: "#00AED6" },
      { text: "OVO", bg: "#4C3494" },
      { text: "D", bg: "#118EE9" },
      { text: "S", bg: "#EE4E2C" },
    ],
  },
  {
    id: "bank",
    label: "Bank Transfer / Instant EFT",
    sub: "(ATM/MBANK/IBANK)",
    icon: Landmark,
  },
  {
    id: "cod",
    label: "Cash on Delivery",
    sub: "(For Pickup & Delivery)",
    icon: Banknote,
  },
] as const;
type PaymentId = (typeof PAYMENT_OPTIONS)[number]["id"];
const PAYMENT_LABELS: Record<PaymentId, string> = {
  ewallet: "E-Wallet (GoPay / OVO / Dana / ShopeePay)",
  bank: "Bank Transfer / EFT",
  cod: "Cash on Delivery / Pickup",
};
const DEFAULT_ADDRESS = "Jl. Melati No.12, Kec. Sukasari, Jakarta Selatan 12430";
const STEPS = ["Address", "Payment", "Confirm"];

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Nanami Kitchen" },
      {
        name: "description",
        content: "Confirm your address, pick a payment method and send your order via WhatsApp.",
      },
      { property: "og:title", content: "Checkout — Nanami Kitchen" },
      { property: "og:description", content: "Fast WhatsApp checkout with manual payment." },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const navigate = useNavigate();
  const { cart, orderType, settings, profile, menu, vouchers, voucherCode, distance } = useStore(
    (s) => ({
      cart: s.cart,
      orderType: s.orderType,
      settings: s.settings,
      profile: s.profile,
      menu: s.menu,
      vouchers: s.vouchers,
      voucherCode: s.voucherCode,
      distance: s.distanceKm,
    }),
  );
  const { subtotal } = cartTotals(cart);

  const [step, setStep] = useState(0);
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [address, setAddress] = useState(profile.address || DEFAULT_ADDRESS);
  const [editingAddress, setEditingAddress] = useState(false);
  const setDistance = (km: number) => actions.setDistanceKm(km);
  const [deliveryNote, setDeliveryNote] = useState("");
  const [payment, setPayment] = useState<PaymentId>("ewallet");
  const [copied, setCopied] = useState("");
  const [error, setError] = useState("");

  const deliveryFee = deliveryFeeFor(settings, orderType, distance, subtotal);
  const voucher = findVoucher(vouchers, voucherCode);
  const discount = discountFor(subtotal, voucher);
  const total = Math.max(0, subtotal + deliveryFee - discount);
  const outOfRange = orderType === "delivery" && distance > settings.maxRadiusKm;
  const detailsMissing = !name.trim() || !phone.trim();
  const valid =
    !detailsMissing && (orderType === "pickup" || address) && !outOfRange && cart.length > 0;

  // Send the customer back to the cart if it empties (but not right after ordering).
  const submittedRef = useRef(false);
  useEffect(() => {
    if (cart.length === 0 && !submittedRef.current) navigate({ to: "/cart" });
  }, [cart.length, navigate]);

  function copy(value: string, label: string) {
    navigator.clipboard?.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(""), 1500);
  }

  function goToStep(next: number) {
    if (next === 1 && outOfRange) {
      setError(`Out of delivery range (max ${settings.maxRadiusKm} km).`);
      return;
    }
    if (next === 2 && detailsMissing) {
      setError("Please fill in your name and WhatsApp number.");
      return;
    }
    setError("");
    setStep(next);
  }

  function submit() {
    if (!valid) return;
    submittedRef.current = true;
    const order = actions.placeOrder({
      type: orderType,
      lines: cart,
      subtotal,
      discount,
      voucherCode: discount > 0 ? voucherCode : "",
      deliveryFee,
      total,
      etaMinutes: orderType === "delivery" ? 35 : 25,
      paymentMethod: PAYMENT_LABELS[payment],
      customer: { name, phone, address, deliveryNote },
    });
    actions.updateProfile({ name, phone, address });
    window.open(
      `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(buildWhatsappMessage(order))}`,
      "_blank",
    );
    navigate({ to: "/order-success" });
  }

  const field =
    "mt-0.5 w-full rounded-lg border border-input bg-secondary/40 px-2.5 py-1.5 text-xs outline-none focus:border-primary transition";

  return (
    <AppShell hideCartBar>
      {/* Header */}
      <div className="flex items-center gap-2 py-0.5">
        <button
          onClick={() => (step > 0 ? setStep(step - 1) : navigate({ to: "/cart" }))}
          aria-label="Back"
          className="text-foreground p-1 hover:bg-secondary/40 rounded-lg transition"
        >
          <ArrowLeft className="size-4" />
        </button>
        <h1 className="text-lg font-bold">{step === 2 ? "Order via WhatsApp" : "Checkout"}</h1>
      </div>

      {/* Step indicator */}
      {step < 2 && (
        <div className="mt-3 flex items-start">
          {STEPS.map((label, i) => (
            <div key={label} className={`flex items-start ${i < STEPS.length - 1 ? "flex-1" : ""}`}>
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${
                    i < step
                      ? "bg-primary text-primary-foreground"
                      : i === step
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {i < step ? <Check className="size-3" /> : i + 1}
                </div>
                <span
                  className={`text-[10px] ${i === step ? "font-bold text-foreground" : "text-muted-foreground"}`}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="mx-2 mt-3 h-0.5 flex-1">
                  <div className={`h-full rounded ${i < step ? "bg-primary" : "bg-secondary"}`} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {step === 0 && (
        <>
          {/* Delivery address card */}
          <section className="mt-3 rounded-xl border border-border bg-card p-3">
            <div className="flex items-start justify-between">
              <h2 className="text-sm font-bold">Delivery Address</h2>
              <button
                onClick={() => navigate({ to: "/address" })}
                className="text-xs font-bold text-primary hover:underline"
              >
                {editingAddress ? "Done" : "Change"}
              </button>
            </div>
            {editingAddress ? (
              <div className="mt-2 space-y-2">
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  className={field}
                />
                <label className="block text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" /> Distance from kitchen: {distance} km
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={20}
                    value={distance}
                    onChange={(e) => setDistance(Number(e.target.value))}
                    className="mt-1 w-full accent-[var(--primary)]"
                  />
                </label>
                <input
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  placeholder="Delivery note (e.g. leave at security post)"
                  className={field}
                />
              </div>
            ) : (
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {orderType === "delivery" ? address : "Pickup at Nanami Kitchen"}
              </p>
            )}
            {outOfRange && (
              <p className="mt-2 rounded-lg bg-destructive/15 px-2.5 py-1.5 text-[11px] text-destructive">
                Out of delivery range (max {settings.maxRadiusKm} km).
              </p>
            )}
          </section>

          {/* Delivery method */}
          <h2 className="mt-3 text-xs font-bold">Delivery Method</h2>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            {(["delivery", "pickup"] as const).map((t) => (
              <button
                key={t}
                onClick={() => actions.setOrderType(t)}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold capitalize transition ${
                  orderType === t
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "border border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                <span
                  className={`size-1.5 rounded-full ${orderType === t ? "bg-primary-foreground" : "bg-muted-foreground/50"}`}
                />
                {t}
              </button>
            ))}
          </div>

          {/* Fee & ETA */}
          <div className="mt-3 space-y-1.5 rounded-xl border border-border bg-card p-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span className="font-semibold">{rupiah(deliveryFee)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Estimated Arrival</span>
              <span className="font-semibold">
                {orderType === "delivery" ? "25 - 35 minutes" : "15 - 25 minutes"}
              </span>
            </div>
          </div>

          {/* Map */}
          {orderType === "delivery" && (
            <img
              src={mapImg}
              alt="Delivery area map"
              width={1024}
              height={640}
              loading="lazy"
              className="mt-2.5 h-28 w-full rounded-xl border border-border object-cover"
            />
          )}

          {error && (
            <p className="mt-2 rounded-lg bg-destructive/15 px-2.5 py-1.5 text-[11px] text-destructive">
              {error}
            </p>
          )}
          <button
            onClick={() => goToStep(1)}
            className="mt-3 w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground transition hover:brightness-105"
          >
            Continue &rarr;
          </button>
        </>
      )}

      {step === 1 && (
        <>
          <section className="mt-3 rounded-xl border border-border bg-card p-3">
            <h2 className="text-xs font-bold">Your details</h2>
            <div className="mt-2 space-y-2">
              <label className="block text-[11px] text-muted-foreground">
                Full name
                <input value={name} onChange={(e) => setName(e.target.value)} className={field} />
              </label>
              <label className="block text-[11px] text-muted-foreground">
                WhatsApp number
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className={field} />
              </label>
            </div>
          </section>

          {/* Payment method options */}
          <section className="mt-3 overflow-hidden rounded-xl border border-border bg-card">
            {PAYMENT_OPTIONS.map((opt, i) => {
              const Icon = opt.icon;
              const selected = payment === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setPayment(opt.id)}
                  className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition hover:bg-secondary/40 ${
                    i > 0 ? "border-t border-border" : ""
                  }`}
                >
                  <Icon className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold text-foreground">{opt.label}</span>
                    <span className="mt-0.5 block text-[10px] text-muted-foreground">
                      {opt.sub}
                    </span>
                    {"badges" in opt && opt.badges && (
                      <span className="mt-1.5 flex gap-1">
                        {opt.badges.map((b: { text: string; bg: string }) => (
                          <span
                            key={b.text}
                            style={{ backgroundColor: b.bg }}
                            className="flex h-4 items-center rounded-full px-1.5 text-[9px] font-bold text-white"
                          >
                            {b.text}
                          </span>
                        ))}
                      </span>
                    )}
                  </span>
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
                      selected ? "border-primary" : "border-muted-foreground/50"
                    }`}
                  >
                    {selected && <span className="size-2.5 rounded-full bg-primary" />}
                  </span>
                </button>
              );
            })}
          </section>

          {/* Payment instructions */}
          <h2 className="mt-8 text-xl font-bold">Payment Instructions</h2>
          {payment === "cod" ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Pay in cash when your order arrives or when you pick it up. Please prepare the exact
              amount if possible.
            </p>
          ) : (
            <>
              <p className="mt-3 text-sm text-muted-foreground">
                <span className="mr-2 font-semibold text-foreground">1.</span>
                Transfer to the following account:
              </p>
              <div className="mt-3 flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
                <div className="min-w-0 flex-1">
                  {payment === "bank" ? (
                    <>
                      <p className="flex items-center gap-2">
                        <span className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-xs font-black text-primary">
                          BCA
                        </span>
                        <span className="text-lg font-black italic tracking-wide text-foreground">
                          {settings.bankName}
                        </span>
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">Bank Central Asia (BCA)</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Account Name: <span className="text-foreground">{settings.bankHolder}</span>
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Account No:{" "}
                        <span className="font-semibold text-foreground">
                          {settings.bankAccount}
                        </span>
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-bold text-foreground">E-Wallet</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Account Name: <span className="text-foreground">Nanami Kitchen</span>
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Number:{" "}
                        <span className="font-semibold text-foreground">{settings.ewallet}</span>
                      </p>
                    </>
                  )}
                </div>
                <button
                  onClick={() =>
                    copy(payment === "bank" ? settings.bankAccount : settings.ewallet, "account")
                  }
                  className="flex shrink-0 items-center gap-2 rounded-xl bg-secondary px-4 py-3 text-sm font-semibold text-foreground"
                >
                  <Copy className="size-4" />
                  {copied === "account" ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                <span className="mr-2 font-semibold text-foreground">2.</span>
                Upload proof of payment (Screenshot) in the WhatsApp chat after ordering.
              </p>
            </>
          )}

          {error && (
            <p className="mt-4 rounded-lg bg-destructive/15 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}
          <button
            onClick={() => goToStep(2)}
            className="mt-6 w-full rounded-full bg-primary py-4 text-sm font-bold text-primary-foreground"
          >
            Continue
          </button>
        </>
      )}

      {step === 2 && (
        <>
          {/* Order details card */}
          <section className="mt-6 rounded-3xl border border-border bg-card p-5">
            <h2 className="text-xl font-semibold">Order Details</h2>
            <div className="mt-4 border-t border-border" />
            <div className="mt-4 space-y-5">
              {cart.map((line) => {
                const img = menu.find((m) => m.id === line.itemId)?.image;
                return (
                  <div key={line.id} className="flex items-start gap-3">
                    {img && (
                      <img
                        src={img}
                        alt={line.name}
                        width={56}
                        height={56}
                        loading="lazy"
                        className="size-14 shrink-0 rounded-full object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{line.name}</p>
                      {line.optionLabels.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          ({line.optionLabels.join(", ")})
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">{line.qty}x</p>
                    </div>
                    <p className="shrink-0 font-medium">{rupiah(line.unitPrice * line.qty)}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 border-t border-border" />
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{rupiah(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-muted-foreground">Voucher ({voucherCode})</span>
                <span className="font-semibold text-primary">-{rupiah(discount)}</span>
              </div>
            )}
            {orderType === "delivery" && deliveryFee > 0 && (
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery fee</span>
                <span>{rupiah(deliveryFee)}</span>
              </div>
            )}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold">{rupiah(total)}</span>
            </div>
          </section>

          {/* WhatsApp handoff card */}
          <section className="mt-6 rounded-3xl border border-wa/40 bg-wa-deep/25 p-6">
            <div className="flex items-start gap-4">
              <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-wa shadow-[0_0_30px_var(--color-wa)]">
                <svg viewBox="0 0 24 24" className="size-9 fill-wa-foreground" aria-hidden="true">
                  <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 1.8a8.2 8.2 0 1 1-4.2 15.3l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 0 1 12 3.8Zm-3.1 3.6c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1.1 2.7c.1.2 1.8 2.9 4.5 3.9 2.2.9 2.7.7 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.6-.3l-2-.9c-.3-.1-.5-.2-.7.1l-1 1.2c-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.5-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.5-.6c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.1c-.2-.5-.4-.5-.7-.5h-.5Z" />
                </svg>
              </span>
              <div>
                <h3 className="text-lg font-semibold text-wa">Open WhatsApp</h3>
                <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                  Your order will be sent automatically with the details and payment proof
                </p>
              </div>
            </div>
            {!valid && (
              <p className="mt-4 rounded-lg bg-destructive/15 px-3 py-2 text-xs text-destructive">
                {detailsMissing
                  ? "Add your name and WhatsApp number in the previous step to continue."
                  : outOfRange
                    ? `Out of delivery range (max ${settings.maxRadiusKm} km).`
                    : "Your cart is empty."}
              </p>
            )}
            <button
              disabled={!valid}
              onClick={submit}
              className="mt-6 w-full rounded-2xl bg-[linear-gradient(135deg,var(--wa),oklch(0.7_0.17_158))] py-4 text-sm font-bold text-wa-foreground shadow-[0_8px_24px_-8px_var(--color-wa)] disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
            >
              Continue to WhatsApp
            </button>
          </section>
        </>
      )}
    </AppShell>
  );
}
