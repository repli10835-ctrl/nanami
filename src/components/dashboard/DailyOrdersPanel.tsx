import { useMemo, useState } from "react";
import { Printer } from "lucide-react";
import { rupiah, useStore, type Order } from "@/lib/store";
import { printReceipt } from "./OrdersPanel";
import { StatCard } from "./DashboardShell";

const DAY = 86400000;

const dayLabel = (offset: number) => {
  const d = new Date(Date.now() - offset * DAY);
  if (offset === 0) return "Hari ini";
  if (offset === 1) return "Kemarin";
  return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short" });
};

const time = (ts: number) =>
  new Date(ts).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

function OrderRow({ order }: { order: Order }) {
  return (
    <li className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-secondary/30 px-3 py-2.5 text-sm">
      <span className="w-14 shrink-0 text-xs text-muted-foreground">{time(order.createdAt)}</span>
      <span className="font-semibold">{order.code}</span>
      <span className="min-w-28 flex-1 truncate text-xs text-muted-foreground">
        {order.customer.name || "Guest"} · {order.lines.reduce((t, l) => t + l.qty, 0)} item ·{" "}
        {order.type}
      </span>
      <span className="text-xs font-semibold">{rupiah(order.total)}</span>
      <span
        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
          order.status === "Completed"
            ? "bg-success/15 text-success"
            : order.status === "Cancelled"
              ? "bg-destructive/15 text-destructive"
              : "bg-primary/15 text-primary"
        }`}
      >
        {order.status}
      </span>
      <button
        onClick={() => printReceipt(order)}
        aria-label={`Cetak struk ${order.code}`}
        className="text-muted-foreground"
      >
        <Printer className="size-4" />
      </button>
    </li>
  );
}

export function DailyOrdersPanel() {
  const orders = useStore((s) => s.orders);
  const [openDay, setOpenDay] = useState(0);

  const days = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, offset) => {
      const from = start.getTime() - offset * DAY;
      const list = orders
        .filter((o) => o.createdAt >= from && o.createdAt < from + DAY)
        .sort((a, b) => b.createdAt - a.createdAt);
      const revenue = list
        .filter((o) => o.status !== "Cancelled")
        .reduce((t, o) => t + o.total, 0);
      return { offset, list, revenue };
    });
  }, [orders]);

  const today = days[0]!;
  const week = days.reduce((t, d) => t + d.revenue, 0);
  const weekCount = days.reduce((t, d) => t + d.list.length, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Pesanan hari ini"
          value={String(today.list.length)}
          hint={rupiah(today.revenue)}
        />
        <StatCard
          label="Selesai hari ini"
          value={String(today.list.filter((o) => o.status === "Completed").length)}
          hint="Sudah dituntaskan"
        />
        <StatCard
          label="Batal hari ini"
          value={String(today.list.filter((o) => o.status === "Cancelled").length)}
          hint="Perlu ditinjau"
        />
        <StatCard label="Omzet 7 hari" value={rupiah(week)} hint={`${weekCount} pesanan`} />
      </div>

      <section className="glow-card space-y-3 p-4">
        <div>
          <h2 className="text-sm font-semibold">Pesanan hari ini</h2>
          <p className="text-xs text-muted-foreground">Diurutkan dari yang terbaru.</p>
        </div>
        {today.list.length === 0 ? (
          <p className="text-xs text-muted-foreground">Belum ada pesanan masuk hari ini.</p>
        ) : (
          <ul className="space-y-2">
            {today.list.map((o) => (
              <OrderRow key={o.id} order={o} />
            ))}
          </ul>
        )}
      </section>

      <section className="glow-card space-y-2 p-4">
        <div>
          <h2 className="text-sm font-semibold">Riwayat 7 hari terakhir</h2>
          <p className="text-xs text-muted-foreground">Klik tanggal untuk melihat detail.</p>
        </div>
        {days.slice(1).map((d) => (
          <div key={d.offset} className="rounded-xl border border-border bg-secondary/20">
            <button
              onClick={() => setOpenDay(openDay === d.offset ? 0 : d.offset)}
              aria-expanded={openDay === d.offset}
              className="flex w-full items-center justify-between px-3 py-2.5 text-sm"
            >
              <span className="font-medium">{dayLabel(d.offset)}</span>
              <span className="text-xs text-muted-foreground">
                {d.list.length} pesanan · {rupiah(d.revenue)}
              </span>
            </button>
            {openDay === d.offset && (
              <ul className="space-y-2 px-3 pb-3">
                {d.list.length === 0 ? (
                  <li className="text-xs text-muted-foreground">Tidak ada pesanan.</li>
                ) : (
                  d.list.map((o) => <OrderRow key={o.id} order={o} />)
                )}
              </ul>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
