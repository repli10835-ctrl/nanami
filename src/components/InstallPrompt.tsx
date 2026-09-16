import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<unknown> };

let installDismissed = false;

export function InstallPrompt() {
  const [event, setEvent] = useState<InstallEvent | null>(null);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (installDismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setEvent(e as InstallEvent);
      setHidden(false);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (hidden || !event) return null;

  function dismiss() {
    installDismissed = true;
    setHidden(true);
  }

  return (
    <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-3">
      <div className="w-full flex items-center gap-3 rounded-2xl border border-border bg-popover/95 px-4 py-3 shadow-lg backdrop-blur">
        <Download className="size-5 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Install Nanami Kitchen</p>
          <p className="text-xs text-muted-foreground">Order faster from your home screen.</p>
        </div>
        <button
          onClick={async () => {
            await event.prompt();
            dismiss();
          }}
          className="rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground"
        >
          Install
        </button>
        <button onClick={dismiss} aria-label="Dismiss" className="text-muted-foreground">
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
