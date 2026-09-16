import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardShell, SectionCard, StatCard } from "@/components/dashboard/DashboardShell";
import { rupiah, useStore } from "@/lib/store";

export const Route = createFileRoute("/owner/")({
  head: () => ({
    meta: [
      { title: "Business Overview — Owner Panel Nanami Kitchen" },
      {
        name: "description",
        content:
          "Nanami Kitchen business performance: daily, weekly, monthly sales, order volume, and top sellers.",
      },
      { property: "og:title", content: "Business Overview — Owner Panel Nanami Kitchen" },
      { property: "og:description", content: "Business performance overview for Nanami Kitchen." },
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
      label: new Date(from).toLocaleDateString("en-ZA", { weekday: "short" }),
      total,
    };
  });
  const peak = Math.max(1, ...trend.map((t) => t.total));

  return (
    <DashboardShell
      role="owner"
      title="Business Overview"
      subtitle="Full control and insights for Nanami Kitchen"
      actions={
        <Link
          to="/owner/menu"
          className="rounded-full bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground"
        >
          Manage catalog
        </Link>
      }
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Today's Sales" value={rupiah(today)} hint="Past 24 hours" />
        <StatCard label="7-Day Sales" value={rupiah(week)} hint="Current week" />
        <StatCard
          label="30-Day Sales"
          value={rupiah(month)}
          hint={`${monthOrders.length} orders`}
        />
        <StatCard label="Average Order Value" value={rupiah(avg)} hint="Past 30 days" />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total Orders" value={String(orders.length)} hint="All Time" />
        <StatCard
          label="Cancelled Orders"
          value={String(orders.filter((o) => o.status === "Cancelled").length)}
          hint="Requires review"
        />
        <StatCard label="Catalog Items" value={String(menu.length)} hint="All categories" />
        <StatCard
          label="Team & Customers"
          value={`${staff.length} / ${accounts.length}`}
          hint="Staff / Customer accounts"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2 lg:items-start">
        <SectionCard title="Sales Trend" description="Total sales over the past 7 days.">
          <div className="flex h-40 items-end gap-2">
            {trend.map((t) => (
              <div key={t.label} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground">
                  {t.total ? rupiah(t.total) : rupiah(0)}
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

        <SectionCard title="Top Sellers" description="Based on total portions sold.">
          {best.length === 0 ? (
            <p className="text-xs text-muted-foreground">No recorded sales yet.</p>
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
                  <span className="text-xs text-muted-foreground">{qty} portions</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { to: "/owner/menu", label: "Catalog CRUD" },
          { to: "/owner/staff", label: "Accounts & Staff" },
          { to: "/owner/settings", label: "Store Settings" },
          { to: "/owner/shipping", label: "Delivery Rates" },
          { to: "/owner/finance", label: "Financial Reports" },
          { to: "/owner/vouchers", label: "Promos & Vouchers" },
          { to: "/owner/audit", label: "Activity Logs" },
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
