import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { MenuCrudPanel } from "@/components/dashboard/MenuCrudPanel";
import { actions, useStore, type MenuItem } from "@/lib/store";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { StickySaveBar } from "@/components/StickySaveBar";
import { UnsavedChangesPrompt } from "@/components/UnsavedChangesPrompt";

export const Route = createFileRoute("/admin/menu")({
  head: () => ({
    meta: [
      { title: "Manage Menu & Catalog — Admin Panel Nanami Kitchen" },
      {
        name: "description",
        content: "Add, edit, delete items, adjust prices, and manage menu availability.",
      },
      { property: "og:title", content: "Manage Menu — Nanami Kitchen" },
      {
        property: "og:description",
        content: "Full CRUD menu management for Nanami Kitchen.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminMenuPage,
});

function AdminMenuPage() {
  const globalMenu = useStore((s) => s.menu);
  const [localMenu, setLocalMenu] = useState<MenuItem[]>(() => globalMenu);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalMenu(globalMenu);
  }, [globalMenu]);

  const { isDirty, markSaved, resetToSnapshot, blocker } = useUnsavedChanges(localMenu);

  const handleSaveMenuItem = (item: MenuItem) => {
    setLocalMenu((prev) => {
      if (prev.some((x) => x.id === item.id)) {
        return prev.map((x) => (x.id === item.id ? item : x));
      } else {
        return [...prev, item];
      }
    });
  };

  const handleDeleteMenuItem = (id: string) => {
    setLocalMenu((prev) => prev.filter((x) => x.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Delete menu items that were removed
      const deleted = globalMenu.filter((gm) => !localMenu.some((lm) => lm.id === gm.id));
      for (const item of deleted) {
        await actions.deleteMenuItem(item.id);
      }

      // 2. Save added/updated items
      for (const item of localMenu) {
        const gm = globalMenu.find((x) => x.id === item.id);
        if (!gm || JSON.stringify(gm) !== JSON.stringify(item)) {
          await actions.saveMenuItem(item);
        }
      }

      markSaved(localMenu);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const snapshot = resetToSnapshot();
    setLocalMenu(snapshot);
  };

  return (
    <DashboardShell
      role="admin"
      title="Menu & Catalog CRUD"
      subtitle="Manage meals, prices, images & options"
    >
      <div className="pb-20">
        <MenuCrudPanel
          menu={localMenu}
          onSaveMenuItem={handleSaveMenuItem}
          onDeleteMenuItem={handleDeleteMenuItem}
        />
      </div>

      <StickySaveBar isDirty={isDirty} onSave={handleSave} onReset={handleReset} saving={saving} />
      <UnsavedChangesPrompt blocker={blocker} />
    </DashboardShell>
  );
}
