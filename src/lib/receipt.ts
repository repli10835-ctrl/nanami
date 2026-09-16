import { rupiah, type Order } from "@/lib/store";

export function printReceipt(order: Order) {
  try {
    const w = window.open("", "_blank", "width=380,height=600");
    if (!w) {
      console.warn("Could not open print window (popup may be blocked)");
      return;
    }
    const rows = order.lines
      .map(
        (l) =>
          `<tr><td>${l.qty}x ${l.name}${
            l.optionLabels.length ? `<br/><small>${l.optionLabels.join(", ")}</small>` : ""
          }${l.note ? `<br/><small>note: ${l.note}</small>` : ""}</td><td align="right">${rupiah(
            l.unitPrice * l.qty,
          )}</td></tr>`,
      )
      .join("");
    const vatRow =
      order.vatAmount && order.vatAmount > 0
        ? `<tr><td>VAT (${order.vatPercent ?? 15}%)</td><td align="right">${rupiah(order.vatAmount)}</td></tr>`
        : "";
    const deliveryRow =
      order.deliveryFee > 0
        ? `<tr><td>Delivery Fee</td><td align="right">${rupiah(order.deliveryFee)}</td></tr>`
        : "";
    const discountRow =
      order.discount > 0
        ? `<tr><td>Discount</td><td align="right">-${rupiah(order.discount)}</td></tr>`
        : "";
    w.document.write(
      `<pre style="font-family:monospace;font-size:12px">NANAMI KITCHEN\nOrder ${order.code}\n${new Date(
        order.createdAt,
      ).toLocaleString("id-ID")}\n${order.type.toUpperCase()} · ${order.customer.name}\n</pre>` +
        `<table style="width:100%;font-family:monospace;font-size:12px">${rows}${vatRow}${deliveryRow}${discountRow}</table>` +
        `<pre style="font-family:monospace;font-size:12px">\nTotal ${rupiah(order.total)}\n${
          order.paymentMethod
        }</pre>`,
    );
    w.document.close();
    w.print();
  } catch (err) {
    console.error("Failed to print receipt:", err);
  }
}
