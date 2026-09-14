import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StaffPanel } from "@/components/dashboard/StaffPanel";

export const Route = createFileRoute("/owner/staff")({
  head: () => ({
    meta: [
      { title: "Accounts & Staff — Owner Panel Nanami Kitchen" },
      {
        name: "description",
        content:
          "Manage Nanami Kitchen team accounts: invite members, assign owner, admin, or staff roles, and view permissions.",
      },
      { property: "og:title", content: "Accounts & Staff — Owner Panel Nanami Kitchen" },
      {
        property: "og:description",
        content: "Manage team accounts and permissions for Nanami Kitchen.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <DashboardShell
      role="owner"
      title="Accounts & Staff"
      subtitle="Configure owner, admin, and staff roles and permissions"
    >
      <StaffPanel />
    </DashboardShell>
  ),
});
