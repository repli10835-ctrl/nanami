import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, SectionCard } from "@/components/dashboard/DashboardShell";
import { ReportsPanel } from "@/components/dashboard/ReportsPanel";
import { rupiah, useStore } from "@/lib/store";

export const Route = createFileRoute("/owner/finance")({
  head: () => ({
    meta: [
      { title: "Laporan Keuangan — Panel Owner Nanami Kitchen" },
      {
        name: "description",
        content: "Omzet, metode pembayaran, dan rekap keuangan Nanami Kitchen untuk owner.",
      },
      { property: "og:title", content: "Laporan Keuangan — Nanami Kitchen" },
      { property: "og:description", content: "Omzet dan rekap pembayaran Nanami Kitchen." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FinancePage,
});

function FinancePage() {
  const orders = useStore((s) => s.orders);
  const paid = orders.filter((o) => o.status !== "Cancelled");
  const methods = new Map<string, { count: number; total: number }>();
  paid.forEach((o) => {
    const prev = methods.get(o.paymentMethod) ?? { count: 0, total: 0 };
    methods.set(o.paymentMethod, { count: prev.count + 1, total: prev.total + o.total });
  });
  const delivery = paid.reduce((t, o) => t + o.deliveryFee, 0);
  const discount = paid.reduce((t, o) => t + o.discount, 0);

  return (
    <DashboardShell role="owner" title="Keuangan" subtitle="Rekap pemasukan dan potongan">
      <ReportsPanel />

      <div className="mt-4 grid gap-4 lg:grid-cols-2 lg:items-start">
        <SectionCard title="Metode pembayaran">
          {methods.size === 0 ? (
            <p className="text-xs text-muted-foreground">Belum ada transaksi.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {[...methods.entries()].map(([m, v]) => (
                <li
                  key={m}
                  className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 px-3 py-2.5"
                >
                  <span>{m}</span>
                  <span className="text-xs text-muted-foreground">
                    {v.count}x · {rupiah(v.total)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Komponen lain">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total ongkir tertagih</span>
            <span className="font-semibold">{rupiah(delivery)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total diskon voucher</span>
            <span className="font-semibold text-destructive">-{rupiah(discount)}</span>
          </div>
        </SectionCard>
      </div>
    </DashboardShell>
  );
}
