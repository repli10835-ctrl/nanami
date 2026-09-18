import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { MediaGallery } from "@/components/dashboard/MediaGallery";

export const Route = createFileRoute("/owner/media")({
  head: () => ({
    meta: [
      { title: "Media Library — Owner Panel Nanami Kitchen" },
      {
        name: "description",
        content: "Manage all uploaded images and media assets for Nanami Kitchen.",
      },
      { property: "og:title", content: "Media Library — Owner Panel Nanami Kitchen" },
      {
        property: "og:description",
        content: "Manage store media and image library.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OwnerMediaPage,
});

function OwnerMediaPage() {
  return (
    <DashboardShell role="owner" title="Media Library" subtitle="Manage and upload store images">
      <MediaGallery />
    </DashboardShell>
  );
}
