import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StockPanel } from "@/components/dashboard/StockPanel";

export const Route = createFileRoute("/admin/stock")({
  head: () => ({
    meta: [
      { title: "Daily Menu Stock — Admin Panel Nanami Kitchen" },
      {
        name: "description",
        content:
          "Manage daily Nanami Kitchen menu availability: toggle items available or sold out with one click.",
      },
      { property: "og:title", content: "Daily Menu Stock — Admin Panel Nanami Kitchen" },
      {
        property: "og:description",
        content: "Control daily stock and item availability for Nanami Kitchen.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <DashboardShell
      role="admin"
      title="Daily menu stock"
      subtitle="Mark items as available or sold out today"
    >
      <StockPanel />
    </DashboardShell>
  ),
});
