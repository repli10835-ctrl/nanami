import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StaffPanel } from "@/components/dashboard/StaffPanel";

export const Route = createFileRoute("/owner/staff")({
  head: () => ({
    meta: [
      { title: "Akun & Staf — Panel Owner Nanami Kitchen" },
      {
        name: "description",
        content:
          "Kelola akun tim Nanami Kitchen: undang anggota, atur peran owner, admin, atau staff, dan lihat hak akses.",
      },
      { property: "og:title", content: "Akun & Staf — Panel Owner Nanami Kitchen" },
      { property: "og:description", content: "Kelola akun tim dan hak akses Nanami Kitchen." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <DashboardShell
      role="owner"
      title="Akun & staf"
      subtitle="Atur peran owner, admin, dan staff beserta hak aksesnya"
    >
      <StaffPanel />
    </DashboardShell>
  ),
});
