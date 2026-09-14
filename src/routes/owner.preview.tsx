import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { LivePreviewPanel } from "@/components/dashboard/LivePreviewPanel";

export const Route = createFileRoute("/owner/preview")({
  head: () => ({
    meta: [
      { title: "App Live Preview — Owner Panel Nanami Kitchen" },
      {
        name: "description",
        content: "Multi-device live preview simulator for Nanami Kitchen restaurant customer app.",
      },
      { property: "og:title", content: "Live Preview — Nanami Kitchen" },
      { property: "og:description", content: "Live preview simulator for Nanami Kitchen app." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OwnerPreviewPage,
});

function OwnerPreviewPage() {
  return (
    <DashboardShell
      role="owner"
      title="App Live Preview"
      subtitle="Test customer app appearance in real-time across multiple device screen sizes"
    >
      <LivePreviewPanel />
    </DashboardShell>
  );
}
