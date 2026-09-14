import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { MenuPanel } from "@/components/dashboard/MenuPanel";

export const Route = createFileRoute("/admin/menu")({
  head: () => ({
    meta: [
      { title: "Kelola Menu — Panel Admin Nanami Kitchen" },
      {
        name: "description",
        content: "Tambah item, atur harga, dan ubah ketersediaan menu Nanami Kitchen.",
      },
      { property: "og:title", content: "Kelola Menu — Nanami Kitchen" },
      { property: "og:description", content: "Atur harga dan ketersediaan menu Nanami Kitchen." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <DashboardShell role="admin" title="Menu" subtitle="Ketersediaan dan item harian">
      <MenuPanel canDelete={false} />
    </DashboardShell>
  ),
});
