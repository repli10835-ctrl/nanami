import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SettingsPanel } from "@/components/dashboard/SettingsPanel";
import { actions, useStore, type Settings } from "@/lib/store";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { StickySaveBar } from "@/components/StickySaveBar";
import { UnsavedChangesPrompt } from "@/components/UnsavedChangesPrompt";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Operational Settings — Admin Panel Nanami Kitchen" },
      {
        name: "description",
        content:
          "Configure opening hours, delivery/pickup service, fees and contact details for Nanami Kitchen.",
      },
      { property: "og:title", content: "Operational Settings — Nanami Kitchen" },
      {
        property: "og:description",
        content: "Opening hours, delivery fees, and contact info for Nanami Kitchen.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminSettings,
});

function AdminSettings() {
  const globalSettings = useStore((s) => s.settings);
  const [localSettings, setLocalSettings] = useState(() => globalSettings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalSettings(globalSettings);
    markSaved(globalSettings);
  }, [globalSettings, markSaved]);

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
    <DashboardShell role="admin" title="Operations" subtitle="Services, fees, and payments">
      <div className="space-y-4 pb-20">
        <SettingsPanel scope="admin" settings={localSettings} onChange={handleFieldChange} />
      </div>

      <StickySaveBar isDirty={isDirty} onSave={handleSave} onReset={handleReset} saving={saving} />
      <UnsavedChangesPrompt blocker={blocker} />
    </DashboardShell>
  );
}
