import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { CmsPanel } from "@/components/dashboard/CmsPanel";

export const Route = createFileRoute("/owner/cms")({
  head: () => ({
    meta: [
      { title: "Content CMS & Branding — Owner Panel Nanami Kitchen" },
      {
        name: "description",
        content:
          "Manage public content, logo, tagline, promo banners, and FAQs for Nanami Kitchen.",
      },
      { property: "og:title", content: "Content CMS — Nanami Kitchen" },
      { property: "og:description", content: "Manage public content and logo for Nanami Kitchen." },
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
      title="Content & Public CMS"
      subtitle="Manage logo, visual identity, promo banners, hero tagline, and public details"
    >
      <CmsPanel />
    </DashboardShell>
  );
}
