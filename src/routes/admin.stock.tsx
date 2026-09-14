import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StockPanel } from "@/components/dashboard/StockPanel";

export const Route = createFileRoute("/admin/stock")({
  head: () => ({
    meta: [
      { title: "Stok Menu Harian — Panel Admin Nanami Kitchen" },
      {
        name: "description",
        content:
          "Atur ketersediaan menu harian Nanami Kitchen: tandai item tersedia atau habis dalam sekali sentuh.",
      },
      { property: "og:title", content: "Stok Menu Harian — Panel Admin Nanami Kitchen" },
      {
        property: "og:description",
        content: "Kontrol stok harian dan ketersediaan menu Nanami Kitchen.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <DashboardShell
      role="admin"
      title="Stok menu harian"
      subtitle="Tandai item yang tersedia atau habis hari ini"
    >
      <StockPanel />
    </DashboardShell>
  ),
});
