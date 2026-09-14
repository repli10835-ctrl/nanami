import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DailyOrdersPanel } from "@/components/dashboard/DailyOrdersPanel";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({
    meta: [
      { title: "Daily Orders — Admin Panel Nanami Kitchen" },
      {
        name: "description",
        content:
          "Nanami Kitchen daily order summary complete with 7-day history and receipt printing.",
      },
      { property: "og:title", content: "Daily Orders — Admin Panel Nanami Kitchen" },
      {
        property: "og:description",
        content: "Daily order recap and quick history for Nanami Kitchen.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <DashboardShell
      role="admin"
      title="Daily orders"
      subtitle="Today's recap and past 7 days history"
    >
      <DailyOrdersPanel />
    </DashboardShell>
  ),
});
