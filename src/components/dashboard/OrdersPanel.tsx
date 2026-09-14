import { useState } from "react";
import { Check, Printer } from "lucide-react";
import { actions, rupiah, useStore, type Order, type OrderStatus } from "@/lib/store";

const FLOW: OrderStatus[] = [
  "Pending Payment",
  "Cooking",
  "Out for Delivery",
  "Ready for Pickup",
  "Completed",
  "Cancelled",
];

const FILTERS = ["Semua", ...FLOW] as const;

export function printReceipt(order: Order) {
  const w = window.open("", "_blank", "width=380,height=600");
  if (!w) return;
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
  w.document.write(
    `<pre style="font-family:monospace;font-size:12px">NANAMI KITCHEN\nOrder ${order.code}\n${new Date(
      order.createdAt,
    ).toLocaleString()}\n${order.type.toUpperCase()} · ${order.customer.name}\n</pre>` +
      `<table style="width:100%;font-family:monospace;font-size:12px">${rows}</table>` +
      `<pre style="font-family:monospace;font-size:12px">\nTotal ${rupiah(order.total)}\n${
        order.paymentMethod
      }</pre>`,
  );
  w.document.close();
  w.print();
}

export function OrdersPanel({ readOnly = false }: { readOnly?: boolean }) {
  const orders = useStore((s) => s.orders);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Semua");
  const list = filter === "Semua" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-4">
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-secondary/40 text-muted-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Belum ada pesanan.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {list.map((o) => (
            <div key={o.id} className="glow-card space-y-3 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold">{o.code}</p>
                  <p className="text-xs capitalize text-muted-foreground">
                    {o.type} · {o.customer.name || "Guest"} ·{" "}
                    {new Date(o.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold">
                  {o.status}
                </span>
              </div>

              <ul className="space-y-1 text-xs text-muted-foreground">
                {o.lines.map((l) => (
                  <li key={l.id}>
                    {l.qty}x {l.name}
                    {l.optionLabels.length ? ` (${l.optionLabels.join(", ")})` : ""}
                  </li>
                ))}
              </ul>
              <p className="text-sm font-semibold">
                {rupiah(o.total)} · {o.paymentMethod}
              </p>

              <div className="flex flex-wrap gap-2">
                {!readOnly && o.status === "Pending Payment" && (
                  <button
                    onClick={() => actions.setOrderStatus(o.id, "Cooking")}
                    className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                  >
                    <Check className="size-3.5" /> Tandai lunas
                  </button>
                )}
                <button
                  onClick={() => printReceipt(o)}
                  className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold"
                >
                  <Printer className="size-3.5" /> Cetak
                </button>
                {!readOnly && (
                  <select
                    value={o.status}
                    onChange={(e) => actions.setOrderStatus(o.id, e.target.value as OrderStatus)}
                    className="rounded-lg border border-input bg-secondary/40 px-2 py-1.5 text-xs"
                  >
                    {FLOW.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
