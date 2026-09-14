import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, SectionCard, fieldClass } from "@/components/dashboard/DashboardShell";
import { SettingsPanel } from "@/components/dashboard/SettingsPanel";
import { actions, useStore } from "@/lib/store";

export const Route = createFileRoute("/owner/settings")({
  head: () => ({
    meta: [
      { title: "Store Settings — Owner Panel Nanami Kitchen" },
      {
        name: "description",
        content:
          "Configure restaurant identity, operating hours, delivery options, fees, and payment accounts for Nanami Kitchen.",
      },
      { property: "og:title", content: "Store Settings — Owner Panel Nanami Kitchen" },
      {
        property: "og:description",
        content: "Configuration for restaurant identity and operations at Nanami Kitchen.",
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
      title="Store Settings"
      subtitle="Restaurant identity and service options"
    >
      <div className="space-y-4">
        <SectionCard
          title="Restaurant Identity"
          description="Name and address displayed on the customer app."
        >
          <label className="block text-xs text-muted-foreground">
            Restaurant name
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
            Address
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
