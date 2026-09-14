import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DailyOrdersPanel } from "@/components/dashboard/DailyOrdersPanel";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({
    meta: [
      { title: "Pesanan Harian — Panel Admin Nanami Kitchen" },
      {
        name: "description",
        content:
          "Daftar pesanan harian Nanami Kitchen lengkap dengan riwayat tujuh hari terakhir dan cetak struk.",
      },
      { property: "og:title", content: "Pesanan Harian — Panel Admin Nanami Kitchen" },
      {
        property: "og:description",
        content: "Rekap pesanan harian dan riwayat singkat Nanami Kitchen.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <DashboardShell
      role="admin"
      title="Pesanan harian"
      subtitle="Rekap hari ini dan riwayat 7 hari terakhir"
    >
      <DailyOrdersPanel />
    </DashboardShell>
  ),
});
