import React from "react";

interface StickySaveBarProps {
  isDirty: boolean;
  onSave: () => void;
  onReset: () => void;
  saving?: boolean;
}

export function StickySaveBar({ isDirty, onSave, onReset, saving = false }: StickySaveBarProps) {
  if (!isDirty) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/90 px-4 py-3 shadow-lg backdrop-blur-md animate-in slide-in-from-bottom duration-300">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-6 items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 text-[10px] font-bold text-amber-500">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-500"></span>
            </span>
            Unsaved Changes
          </div>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            You have pending edits. Don't forget to save.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            disabled={saving}
            className="rounded-xl border border-input bg-background px-3.5 py-1.5 text-xs font-bold text-foreground transition hover:bg-secondary disabled:opacity-50"
          >
            Reset
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center justify-center rounded-xl bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground transition hover:brightness-105 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
