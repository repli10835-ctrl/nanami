import { rupiah, useStore, type Order } from "@/lib/store";
import { SectionCard, StatCard } from "./DashboardShell";

export function ReportsPanel() {
  const orders = useStore((s) => s.orders);
  const paid = orders.filter((o) => o.status !== "Cancelled");
  const day = 86400000;
  const today = paid.filter((o) => Date.now() - o.createdAt < day);
  const week = paid.filter((o) => Date.now() - o.createdAt < 7 * day);
  const month = paid.filter((o) => Date.now() - o.createdAt < 30 * day);
  const sum = (list: Order[]) => list.reduce((t, o) => t + o.total, 0);
  const avg = paid.length ? sum(paid) / paid.length : 0;

  const counts = new Map<string, number>();
  paid.forEach((o) =>
    o.lines.forEach((l) => counts.set(l.name, (counts.get(l.name) ?? 0) + l.qty)),
  );
  const best = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxQty = best[0]?.[1] ?? 1;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Hari ini" value={rupiah(sum(today))} hint={`${today.length} pesanan`} />
        <StatCard label="7 hari" value={rupiah(sum(week))} hint={`${week.length} pesanan`} />
        <StatCard label="30 hari" value={rupiah(sum(month))} hint={`${month.length} pesanan`} />
        <StatCard label="Rata-rata order" value={rupiah(Math.round(avg))} hint="Semua waktu" />
      </div>

      <SectionCard title="Menu terlaris">
        {best.length === 0 ? (
          <p className="text-xs text-muted-foreground">Belum ada penjualan.</p>
        ) : (
          <ul className="space-y-2.5">
            {best.map(([n, q]) => (
              <li key={n}>
                <div className="flex justify-between text-sm">
                  <span>{n}</span>
                  <span className="text-muted-foreground">{q} terjual</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-secondary">
                  <div
                    className="h-1.5 rounded-full bg-primary"
                    style={{ width: `${(q / maxQty) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
