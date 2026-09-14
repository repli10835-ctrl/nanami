import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SettingsPanel } from "@/components/dashboard/SettingsPanel";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Pengaturan Operasional — Panel Admin Nanami Kitchen" },
      {
        name: "description",
        content: "Atur jam buka, layanan delivery/pickup, ongkir dan kontak Nanami Kitchen.",
      },
      { property: "og:title", content: "Pengaturan Operasional — Nanami Kitchen" },
      { property: "og:description", content: "Jam buka, ongkir, dan kontak Nanami Kitchen." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <DashboardShell role="admin" title="Operasional" subtitle="Layanan, ongkir, dan pembayaran">
      <SettingsPanel />
    </DashboardShell>
  ),
});
