import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { MenuCrudPanel } from "@/components/dashboard/MenuCrudPanel";

export const Route = createFileRoute("/admin/menu")({
  head: () => ({
    meta: [
      { title: "Manage Menu & Catalog — Admin Panel Nanami Kitchen" },
      {
        name: "description",
        content: "Add, edit, delete items, adjust prices, and manage menu availability.",
      },
      { property: "og:title", content: "Manage Menu — Nanami Kitchen" },
      {
        property: "og:description",
        content: "Full CRUD menu management for Nanami Kitchen.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <DashboardShell
      role="admin"
      title="Menu & Catalog CRUD"
      subtitle="Manage food items, prices, images & options"
    >
      <MenuCrudPanel />
    </DashboardShell>
  ),
});
