import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { CmsPanel } from "@/components/dashboard/CmsPanel";
import {
  actions,
  useStore,
  defaultCmsContent,
  type CmsContent,
  type Promo,
  type Settings,
} from "@/lib/store";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { StickySaveBar } from "@/components/StickySaveBar";
import { UnsavedChangesPrompt } from "@/components/UnsavedChangesPrompt";

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

interface CmsPageState {
  cms: CmsContent;
  promos: Promo[];
  settings: Settings;
}

function OwnerCmsPage() {
  const globalCms = useStore((s) => s.cms || defaultCmsContent);
  const globalPromos = useStore((s) => s.promos);
  const globalSettings = useStore((s) => s.settings);

  const [localState, setLocalState] = useState<CmsPageState>(() => ({
    cms: globalCms,
    promos: globalPromos,
    settings: globalSettings,
  }));

  const [saving, setSaving] = useState(false);

  const { isDirty, markSaved, resetToSnapshot, blocker } = useUnsavedChanges(localState);

  useEffect(() => {
    const nextState = {
      cms: globalCms,
      promos: globalPromos,
      settings: globalSettings,
    };
    setLocalState(nextState);
    markSaved(nextState);
  }, [globalCms, globalPromos, globalSettings, markSaved]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Delete promos that are no longer present
      const deletedPromos = globalPromos.filter(
        (gp) => !localState.promos.some((lp) => lp.id === gp.id),
      );
      for (const dp of deletedPromos) {
        await actions.deletePromo(dp.id);
      }

      // 2. Save active / updated promos
      for (const lp of localState.promos) {
        const gp = globalPromos.find((x) => x.id === lp.id);
        if (!gp || JSON.stringify(gp) !== JSON.stringify(lp)) {
          await actions.savePromo(lp);
        }
      }

      // 3. Save Settings to DB
      if (JSON.stringify(globalSettings) !== JSON.stringify(localState.settings)) {
        await actions.updateSettings(localState.settings);
      }

      // 4. Save CMS content to DB
      await actions.updateCms(localState.cms);

      markSaved(localState);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const snapshot = resetToSnapshot();
    setLocalState(snapshot);
  };

  return (
    <DashboardShell
      role="owner"
      title="Content & Public CMS"
      subtitle="Manage logo, visual identity, promo banners, hero tagline, and public details"
    >
      <div className="pb-20">
        <CmsPanel
          cms={localState.cms}
          promos={localState.promos}
          settings={localState.settings}
          onChangeCms={(cms) => setLocalState((prev) => ({ ...prev, cms }))}
          onChangePromos={(promos) => setLocalState((prev) => ({ ...prev, promos }))}
          onChangeSettings={(settings) => setLocalState((prev) => ({ ...prev, settings }))}
          onResetCms={() => setLocalState((prev) => ({ ...prev, cms: defaultCmsContent }))}
        />
      </div>

      <StickySaveBar isDirty={isDirty} onSave={handleSave} onReset={handleReset} saving={saving} />
      <UnsavedChangesPrompt blocker={blocker} />
    </DashboardShell>
  );
}
