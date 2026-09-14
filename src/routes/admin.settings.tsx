import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SettingsPanel } from "@/components/dashboard/SettingsPanel";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Operational Settings — Admin Panel Nanami Kitchen" },
      {
        name: "description",
        content:
          "Configure opening hours, delivery/pickup service, fees and contact details for Nanami Kitchen.",
      },
      { property: "og:title", content: "Operational Settings — Nanami Kitchen" },
      {
        property: "og:description",
        content: "Opening hours, delivery fees, and contact info for Nanami Kitchen.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <DashboardShell role="admin" title="Operations" subtitle="Services, fees, and payments">
      <SettingsPanel />
    </DashboardShell>
  ),
});
