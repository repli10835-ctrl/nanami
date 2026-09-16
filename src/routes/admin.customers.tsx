import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { CustomerPanel } from "@/components/dashboard/CustomerPanel";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({
    meta: [
      { title: "Customers — Admin Panel Nanami Kitchen" },
      {
        name: "description",
        content: "Manage registered customers, loyalty points, and profiles for Nanami Kitchen.",
      },
      { property: "og:title", content: "Customers — Admin Panel Nanami Kitchen" },
      {
        property: "og:description",
        content: "Customer management for Nanami Kitchen.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <DashboardShell
      role="admin"
      title="Customers"
      subtitle="Manage registered users and loyalty points"
    >
      <CustomerPanel />
    </DashboardShell>
  ),
});
