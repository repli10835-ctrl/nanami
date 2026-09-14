import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ReportsPanel } from "@/components/dashboard/ReportsPanel";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({
    meta: [
      { title: "Laporan Penjualan — Panel Admin Nanami Kitchen" },
      {
        name: "description",
        content: "Rekap omzet harian, mingguan, bulanan dan menu terlaris Nanami Kitchen.",
      },
      { property: "og:title", content: "Laporan Penjualan — Nanami Kitchen" },
      { property: "og:description", content: "Rekap omzet dan menu terlaris Nanami Kitchen." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <DashboardShell role="admin" title="Laporan" subtitle="Performa penjualan">
      <ReportsPanel />
    </DashboardShell>
  ),
});
