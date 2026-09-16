import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { MediaGallery } from "@/components/dashboard/MediaGallery";

export const Route = createFileRoute("/admin/media")({
  head: () => ({
    meta: [
      { title: "Media Gallery — Admin Panel Nanami Kitchen" },
      {
        name: "description",
        content: "Manage all uploaded images and media assets for Nanami Kitchen.",
      },
      { property: "og:title", content: "Media Gallery — Nanami Kitchen" },
      {
        property: "og:description",
        content: "Manage store media and image library.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminMediaPage,
});

function AdminMediaPage() {
  return (
    <DashboardShell role="admin" title="Media Gallery" subtitle="Manage and upload store images">
      <MediaGallery />
    </DashboardShell>
  );
}
