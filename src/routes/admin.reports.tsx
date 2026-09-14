import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ReportsPanel } from "@/components/dashboard/ReportsPanel";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({
    meta: [
      { title: "Sales Reports — Admin Panel Nanami Kitchen" },
      {
        name: "description",
        content: "Daily, weekly, and monthly revenue recap and top sellers for Nanami Kitchen.",
      },
      { property: "og:title", content: "Sales Reports — Nanami Kitchen" },
      { property: "og:description", content: "Revenue recap and top sellers for Nanami Kitchen." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <DashboardShell role="admin" title="Reports" subtitle="Sales performance and metrics">
      <ReportsPanel />
    </DashboardShell>
  ),
});
