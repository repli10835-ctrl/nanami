import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { LivePreviewPanel } from "@/components/dashboard/LivePreviewPanel";

export const Route = createFileRoute("/owner/preview")({
  head: () => ({
    meta: [
      { title: "Live Preview Aplikasi — Panel Owner Nanami Kitchen" },
      {
        name: "description",
        content: "Simulator live preview aplikasi restoran Nanami Kitchen multi-device.",
      },
      { property: "og:title", content: "Live Preview — Nanami Kitchen" },
      { property: "og:description", content: "Simulator live preview aplikasi Nanami Kitchen." },
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
      title="Live Preview Aplikasi"
      subtitle="Uji tampilan aplikasi pembeli secara langsung pada berbagai ukuran layar perangkat"
    >
      <LivePreviewPanel />
    </DashboardShell>
  );
}
