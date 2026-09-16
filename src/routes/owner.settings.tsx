import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, SectionCard, fieldClass } from "@/components/dashboard/DashboardShell";
import { SettingsPanel } from "@/components/dashboard/SettingsPanel";
import { actions, useStore, type Settings } from "@/lib/store";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { StickySaveBar } from "@/components/StickySaveBar";
import { UnsavedChangesPrompt } from "@/components/UnsavedChangesPrompt";

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
  const globalSettings = useStore((s) => s.settings);
  const [localSettings, setLocalSettings] = useState(() => globalSettings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalSettings(globalSettings);
  }, [globalSettings]);

  const { isDirty, markSaved, resetToSnapshot, blocker } = useUnsavedChanges(localSettings);

  const handleFieldChange = (patch: Partial<Settings>) => {
    setLocalSettings((prev) => ({ ...prev, ...patch }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await actions.updateSettings(localSettings);
      markSaved(localSettings);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const snapshot = resetToSnapshot();
    setLocalSettings(snapshot);
  };

  return (
    <DashboardShell
      role="owner"
      title="Store Settings"
      subtitle="Restaurant identity and service options"
    >
      <div className="space-y-4 pb-20">
        <SectionCard
          title="Restaurant Identity"
          description="Name and address displayed on the customer app."
        >
          <label className="block text-xs text-muted-foreground">
            Restaurant name
            <input
              value={localSettings.storeName}
              type="text"
              onChange={(e) => handleFieldChange({ storeName: e.target.value })}
              className={fieldClass}
            />
          </label>
          <label className="block text-xs text-muted-foreground">
            Tagline
            <input
              value={localSettings.storeTagline}
              type="text"
              onChange={(e) => handleFieldChange({ storeTagline: e.target.value })}
              className={fieldClass}
            />
          </label>
          <label className="block text-xs text-muted-foreground">
            Address
            <textarea
              value={localSettings.storeAddress}
              onChange={(e) => handleFieldChange({ storeAddress: e.target.value })}
              rows={2}
              className={fieldClass}
            />
          </label>
        </SectionCard>

        <SettingsPanel scope="owner" settings={localSettings} onChange={handleFieldChange} />
      </div>

      <StickySaveBar isDirty={isDirty} onSave={handleSave} onReset={handleReset} saving={saving} />
      <UnsavedChangesPrompt blocker={blocker} />
    </DashboardShell>
  );
}
