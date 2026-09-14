import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { MenuCrudPanel } from "@/components/dashboard/MenuCrudPanel";

export const Route = createFileRoute("/owner/menu")({
  head: () => ({
    meta: [
      { title: "Menu Catalog — Owner Panel Nanami Kitchen" },
      {
        name: "description",
        content:
          "Add, edit, and delete Nanami Kitchen menu catalog items complete with category, price, and image.",
      },
      { property: "og:title", content: "Menu Catalog — Owner Panel Nanami Kitchen" },
      { property: "og:description", content: "Full menu catalog management for Nanami Kitchen." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <DashboardShell
      role="owner"
      title="Menu catalog"
      subtitle="Add, edit, and delete items along with prices and images"
    >
      <MenuCrudPanel />
    </DashboardShell>
  ),
});
