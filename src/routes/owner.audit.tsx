import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, SectionCard } from "@/components/dashboard/DashboardShell";
import { rupiah, useStore } from "@/lib/store";

export const Route = createFileRoute("/owner/audit")({
  head: () => ({
    meta: [
      { title: "Log Aktivitas — Panel Owner Nanami Kitchen" },
      {
        name: "description",
        content:
          "Riwayat aktivitas sistem Nanami Kitchen: pesanan, perubahan status, dan pengaturan.",
      },
      { property: "og:title", content: "Log Aktivitas — Nanami Kitchen" },
      { property: "og:description", content: "Riwayat aktivitas sistem Nanami Kitchen." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuditPage,
});

function AuditPage() {
  const orders = useStore((s) => s.orders);
  const entries = orders.slice(0, 30).map((o) => ({
    id: o.id,
    time: new Date(o.createdAt).toLocaleString(),
    actor: o.customer.name || "Guest",
    action: `Membuat pesanan ${o.code} (${rupiah(o.total)})`,
    status: o.status,
  }));

  return (
    <DashboardShell role="owner" title="Log Aktivitas" subtitle="Jejak transaksi terbaru">
      <SectionCard title="Riwayat">
        {entries.length === 0 ? (
          <p className="text-xs text-muted-foreground">Belum ada aktivitas tercatat.</p>
        ) : (
          <ul className="space-y-2">
            {entries.map((e) => (
              <li
                key={e.id}
                className="rounded-xl border border-border bg-secondary/30 px-3 py-2.5 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{e.actor}</span>
                  <span className="text-xs text-muted-foreground">{e.time}</span>
                </div>
                <p className="text-xs text-muted-foreground">{e.action}</p>
                <span className="mt-1 inline-block rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold">
                  {e.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </DashboardShell>
  );
}
