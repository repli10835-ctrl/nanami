import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, SectionCard, fieldClass } from "@/components/dashboard/DashboardShell";
import { SettingsPanel } from "@/components/dashboard/SettingsPanel";
import { actions, useStore } from "@/lib/store";

export const Route = createFileRoute("/owner/settings")({
  head: () => ({
    meta: [
      { title: "Pengaturan Toko — Panel Owner Nanami Kitchen" },
      {
        name: "description",
        content:
          "Atur identitas restoran, jam operasional, layanan antar, biaya, dan rekening pembayaran Nanami Kitchen.",
      },
      { property: "og:title", content: "Pengaturan Toko — Panel Owner Nanami Kitchen" },
      {
        property: "og:description",
        content: "Konfigurasi identitas dan operasional restoran Nanami Kitchen.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OwnerSettings,
});

function OwnerSettings() {
  const settings = useStore((s) => s.settings);

  return (
    <DashboardShell
      role="owner"
      title="Pengaturan toko"
      subtitle="Identitas restoran dan konfigurasi layanan"
    >
      <div className="space-y-4">
        <SectionCard
          title="Identitas restoran"
          description="Nama dan alamat yang tampil di aplikasi pembeli."
        >
          <label className="block text-xs text-muted-foreground">
            Nama restoran
            <input
              value={settings.storeName}
              onChange={(e) => actions.updateSettings({ storeName: e.target.value })}
              className={fieldClass}
            />
          </label>
          <label className="block text-xs text-muted-foreground">
            Tagline
            <input
              value={settings.storeTagline}
              onChange={(e) => actions.updateSettings({ storeTagline: e.target.value })}
              className={fieldClass}
            />
          </label>
          <label className="block text-xs text-muted-foreground">
            Alamat
            <textarea
              value={settings.storeAddress}
              onChange={(e) => actions.updateSettings({ storeAddress: e.target.value })}
              rows={2}
              className={fieldClass}
            />
          </label>
        </SectionCard>

        <SettingsPanel scope="owner" />
      </div>
    </DashboardShell>
  );
}
