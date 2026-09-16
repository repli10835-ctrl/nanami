import React from "react";

interface UnsavedChangesPromptProps {
  blocker: {
    status: "idle" | "blocked";
    proceed: () => void;
    reset: () => void;
  };
}

export function UnsavedChangesPrompt({ blocker }: UnsavedChangesPromptProps) {
  if (blocker.status !== "blocked") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl border border-border">
        <h3 className="text-base font-bold text-foreground">Unsaved Changes</h3>
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
          You have unsaved changes. If you leave now, your changes will be discarded. Are you sure
          you want to leave?
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={() => blocker.reset()}
            className="rounded-xl bg-secondary px-4 py-2 text-xs font-bold text-secondary-foreground hover:bg-secondary/80 transition"
          >
            Keep Editing
          </button>
          <button
            onClick={() => blocker.proceed()}
            className="rounded-xl bg-destructive px-4 py-2 text-xs font-bold text-destructive-foreground hover:bg-destructive/90 transition"
          >
            Discard & Leave
          </button>
        </div>
      </div>
    </div>
  );
}
