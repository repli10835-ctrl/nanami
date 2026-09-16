import { formatCurrency } from "./currency";
import type { Order } from "./store";

export function cleanWhatsappNumber(raw?: string) {
  if (!raw) return "27812345678";
  let cleaned = raw.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "27" + cleaned.slice(1);
  }
  return cleaned || "27812345678";
}

export function buildWhatsappMessage(order: Order, currencySymbol: string = "N$") {
  const rupiah = (n: number) => formatCurrency(n, currencySymbol);
  const lines = order.lines
    .map(
      (l) =>
        `• *${l.qty}x ${l.name}*${l.optionLabels.length ? ` (${l.optionLabels.join(", ")})` : ""}${
          l.note ? `\n  Note: ${l.note}` : ""
        }\n  Subtotal: ${rupiah(l.unitPrice * l.qty)}`,
    )
    .join("\n\n");

  return [
    `*NEW ORDER #${order.code}*`,
    `------------------------------------------`,
    `👤 *CUSTOMER DETAILS:*`,
    `• Name: ${order.customer.name}`,
    `• WhatsApp No: ${order.customer.phone}`,
    `• Order Type: ${order.type === "delivery" ? "🚚 Delivery" : "🛍️ Pickup (Takeaway)"}`,
    order.type === "delivery" ? `• Delivery Address: ${order.customer.address}` : "",
    order.customer.deliveryNote ? `• Location Note: ${order.customer.deliveryNote}` : "",
    `------------------------------------------`,
    `🍱 *ORDERED ITEMS:*`,
    lines,
    `------------------------------------------`,
    `💵 *PAYMENT SUMMARY:*`,
    `• Items Subtotal: ${rupiah(order.subtotal)}`,
    order.vatAmount && order.vatAmount > 0
      ? `• VAT (${order.vatPercent ?? 15}%): ${rupiah(order.vatAmount)}`
      : "",
    order.discount
      ? `• Voucher Discount${order.voucherCode ? ` (${order.voucherCode})` : ""}: -${rupiah(order.discount)}`
      : "",
    order.type === "delivery" ? `• Delivery Fee: ${rupiah(order.deliveryFee)}` : "",
    `*💰 TOTAL AMOUNT: ${rupiah(order.total)}*`,
    `------------------------------------------`,
    `💳 *PAYMENT METHOD (MANUAL):*`,
    `• ${order.paymentMethod}`,
    "",
    `_Hello Admin / Owner, I have placed the order above via Nanami Kitchen. Please confirm and process my order. Thank you!_`,
  ]
    .filter(Boolean)
    .join("\n");
}
