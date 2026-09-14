import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { CmsPanel } from "@/components/dashboard/CmsPanel";

export const Route = createFileRoute("/owner/cms")({
  head: () => ({
    meta: [
      { title: "CMS Konten & Logo — Panel Owner Nanami Kitchen" },
      {
        name: "description",
        content: "Kelola konten publik, logo, slogan, banner promo, dan FAQ Nanami Kitchen.",
      },
      { property: "og:title", content: "CMS Konten — Nanami Kitchen" },
      { property: "og:description", content: "Kelola konten publik dan logo Nanami Kitchen." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OwnerCmsPage,
});

function OwnerCmsPage() {
  return (
    <DashboardShell
      role="owner"
      title="CMS Konten & Publik"
      subtitle="Kelola logo, identitas visual, banner promo, hero slogan, dan informasi publik"
    >
      <CmsPanel />
    </DashboardShell>
  );
}
