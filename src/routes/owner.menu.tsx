import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { MenuCrudPanel } from "@/components/dashboard/MenuCrudPanel";

export const Route = createFileRoute("/owner/menu")({
  head: () => ({
    meta: [
      { title: "Katalog Menu — Panel Owner Nanami Kitchen" },
      {
        name: "description",
        content:
          "Tambah, ubah, dan hapus item katalog Nanami Kitchen lengkap dengan kategori, harga, dan gambar.",
      },
      { property: "og:title", content: "Katalog Menu — Panel Owner Nanami Kitchen" },
      { property: "og:description", content: "Kelola penuh katalog menu Nanami Kitchen." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <DashboardShell
      role="owner"
      title="Katalog menu"
      subtitle="Tambah, ubah, dan hapus item beserta harga dan gambar"
    >
      <MenuCrudPanel />
    </DashboardShell>
  ),
});
