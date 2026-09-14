import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardShell, SectionCard, StatCard } from "@/components/dashboard/DashboardShell";
import { rupiah, useStore } from "@/lib/store";

export const Route = createFileRoute("/owner/")({
  head: () => ({
    meta: [
      { title: "Ringkasan Bisnis — Panel Owner Nanami Kitchen" },
      {
        name: "description",
        content:
          "Performa bisnis Nanami Kitchen: penjualan harian, mingguan, bulanan, jumlah pesanan, dan menu terlaris.",
      },
      { property: "og:title", content: "Ringkasan Bisnis — Panel Owner Nanami Kitchen" },
      { property: "og:description", content: "Ringkasan performa bisnis Nanami Kitchen." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OwnerHome,
});

const DAY = 86400000;

function OwnerHome() {
  const orders = useStore((s) => s.orders);
  const menu = useStore((s) => s.menu);
  const staff = useStore((s) => s.staff);
  const accounts = useStore((s) => s.accounts);

  const paid = orders.filter((o) => o.status !== "Cancelled");
  const sumIn = (days: number) =>
    paid.filter((o) => Date.now() - o.createdAt < days * DAY).reduce((t, o) => t + o.total, 0);

  const today = sumIn(1);
  const week = sumIn(7);
  const month = sumIn(30);
  const monthOrders = paid.filter((o) => Date.now() - o.createdAt < 30 * DAY);
  const avg = monthOrders.length ? Math.round(month / monthOrders.length) : 0;

  const soldQty = new Map<string, number>();
  paid.forEach((o) =>
    o.lines.forEach((l) => soldQty.set(l.name, (soldQty.get(l.name) ?? 0) + l.qty)),
  );
  const best = [...soldQty.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  const startOfToday = new Date().setHours(0, 0, 0, 0);
  const trend = Array.from({ length: 7 }, (_, i) => {
    const offset = 6 - i;
    const from = startOfToday - offset * DAY;
    const total = paid
      .filter((o) => o.createdAt >= from && o.createdAt < from + DAY)
      .reduce((t, o) => t + o.total, 0);
    return {
      label: new Date(from).toLocaleDateString("id-ID", { weekday: "short" }),
      total,
    };
  });
  const peak = Math.max(1, ...trend.map((t) => t.total));

  return (
    <DashboardShell
      role="owner"
      title="Ringkasan bisnis"
      subtitle="Akses penuh ke seluruh sistem Nanami Kitchen"
      actions={
        <Link
          to="/owner/menu"
          className="rounded-full bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground"
        >
          Kelola katalog
        </Link>
      }
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Penjualan hari ini" value={rupiah(today)} hint="24 jam terakhir" />
        <StatCard label="Penjualan 7 hari" value={rupiah(week)} hint="Minggu berjalan" />
        <StatCard
          label="Penjualan 30 hari"
          value={rupiah(month)}
          hint={`${monthOrders.length} pesanan`}
        />
        <StatCard label="Rata-rata per pesanan" value={rupiah(avg)} hint="30 hari terakhir" />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total pesanan" value={String(orders.length)} hint="Sepanjang waktu" />
        <StatCard
          label="Pesanan dibatalkan"
          value={String(orders.filter((o) => o.status === "Cancelled").length)}
          hint="Perlu ditinjau"
        />
        <StatCard label="Item katalog" value={String(menu.length)} hint="Semua kategori" />
        <StatCard
          label="Tim & pelanggan"
          value={`${staff.length} / ${accounts.length}`}
          hint="Staf / akun pembeli"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2 lg:items-start">
        <SectionCard title="Tren penjualan" description="Total penjualan 7 hari terakhir.">
          <div className="flex h-40 items-end gap-2">
            {trend.map((t) => (
              <div key={t.label} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground">
                  {t.total ? Math.round(t.total / 1000) + "k" : "0"}
                </span>
                <div
                  className="w-full rounded-t-lg bg-primary/70"
                  style={{ height: `${Math.max(4, (t.total / peak) * 100)}%` }}
                />
                <span className="text-[10px] text-muted-foreground">{t.label}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Menu terlaris" description="Berdasarkan jumlah porsi terjual.">
          {best.length === 0 ? (
            <p className="text-xs text-muted-foreground">Belum ada penjualan tercatat.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {best.map(([name, qty], i) => (
                <li
                  key={name}
                  className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 px-3 py-2.5"
                >
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate">{name}</span>
                  <span className="text-xs text-muted-foreground">{qty} porsi</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { to: "/owner/menu", label: "CRUD katalog menu" },
          { to: "/owner/staff", label: "Akun & staf" },
          { to: "/owner/settings", label: "Pengaturan toko" },
          { to: "/owner/shipping", label: "Tarif ongkir" },
          { to: "/owner/finance", label: "Laporan keuangan" },
          { to: "/owner/vouchers", label: "Promo & voucher" },
          { to: "/owner/audit", label: "Log aktivitas" },
        ].map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="rounded-xl border border-border bg-secondary/30 px-3 py-3 text-sm font-medium"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </DashboardShell>
  );
}
