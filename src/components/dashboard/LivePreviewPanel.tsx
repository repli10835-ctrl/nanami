import { useState, useRef } from "react";
import { Link } from "@tanstack/react-router";
import {
  ExternalLink,
  Laptop,
  Maximize2,
  Minimize2,
  Moon,
  Palette,
  Play,
  QrCode,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Settings2,
  Share2,
  Smartphone,
  Sparkles,
  Sun,
  Tablet,
  Volume2,
  Zap,
} from "lucide-react";
import { actions, defaultCmsContent, useStore } from "@/lib/store";
import defaultLogo from "@/assets/nanami-logo.png";

type DevicePreset = {
  id: string;
  name: string;
  width: number;
  height: number;
  icon: typeof Smartphone;
  frameStyle: string;
};

const DEVICES: DevicePreset[] = [
  {
    id: "iphone",
    name: "iPhone 15 Pro",
    width: 393,
    height: 844,
    icon: Smartphone,
    frameStyle: "rounded-[46px] ring-[12px] ring-neutral-800 shadow-2xl",
  },
  {
    id: "android",
    name: "Android Phone",
    width: 360,
    height: 780,
    icon: Smartphone,
    frameStyle: "rounded-[36px] ring-[10px] ring-neutral-700 shadow-2xl",
  },
  {
    id: "tablet",
    name: "Tablet / iPad",
    width: 680,
    height: 880,
    icon: Tablet,
    frameStyle: "rounded-[32px] ring-[12px] ring-neutral-800 shadow-2xl",
  },
];

const APP_PAGES = [
  { path: "/", label: "Store Home" },
  { path: "/vouchers", label: "Promos & Vouchers" },
  { path: "/cart", label: "Shopping Cart" },
  { path: "/checkout", label: "Checkout & Address" },
  { path: "/tracking", label: "Track Order" },
  { path: "/profile", label: "User Profile" },
  { path: "/login", label: "Login / Register" },
];

export function LivePreviewPanel() {
  const { cms, settings } = useStore((s) => ({
    cms: s.cms || defaultCmsContent,
    settings: s.settings,
  }));

  const [selectedDevice, setSelectedDevice] = useState<DevicePreset>(DEVICES[0]);
  const [currentPath, setCurrentPath] = useState("/");
  const [zoom, setZoom] = useState<number>(0.85);
  const [isLandscape, setIsLandscape] = useState(false);
  const [iframeKey, setIframeKey] = useState(1);
  const [showQuickEditor, setShowQuickEditor] = useState(false);
  const [currentTime, setCurrentTime] = useState("09:41");

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const activeWidth = isLandscape ? selectedDevice.height : selectedDevice.width;
  const activeHeight = isLandscape ? selectedDevice.width : selectedDevice.height;

  const reloadIframe = () => {
    setIframeKey((k) => k + 1);
  };

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    if (iframeRef.current) {
      try {
        iframeRef.current.src = path;
      } catch {
        setIframeKey((k) => k + 1);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
        {/* Device Selectors */}
        <div className="flex flex-wrap items-center gap-1.5">
          {DEVICES.map((d) => {
            const Icon = d.icon;
            const active = selectedDevice.id === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setSelectedDevice(d)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className="size-3.5" />
                <span>{d.name}</span>
              </button>
            );
          })}

          <div className="mx-1 h-5 w-px bg-border" />

          {/* Orientation toggle */}
          <button
            onClick={() => setIsLandscape((l) => !l)}
            title="Toggle Orientation (Portrait / Landscape)"
            className={`flex items-center gap-1.5 rounded-xl border border-border px-2.5 py-1.5 text-xs font-medium transition ${
              isLandscape ? "bg-secondary text-primary" : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            <RotateCw className="size-3.5" />
            <span className="hidden sm:inline">{isLandscape ? "Landscape" : "Portrait"}</span>
          </button>
        </div>

        {/* Page Switcher */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-muted-foreground">Page:</label>
          <select
            value={currentPath}
            onChange={(e) => handleNavigate(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {APP_PAGES.map((p) => (
              <option key={p.path} value={p.path}>
                {p.label} ({p.path})
              </option>
            ))}
          </select>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 rounded-xl border border-border bg-secondary/30 p-1">
            {[0.7, 0.85, 1].map((scale) => (
              <button
                key={scale}
                onClick={() => setZoom(scale)}
                className={`rounded-lg px-2 py-0.5 text-[11px] font-bold ${
                  zoom === scale
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {Math.round(scale * 100)}%
              </button>
            ))}
          </div>

          <button
            onClick={reloadIframe}
            title="Reload Preview (Test Splash Screen)"
            className="flex size-8 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            <RefreshCw className="size-3.5" />
          </button>

          <Link
            to="/owner/cms"
            className="flex items-center gap-1.5 rounded-xl border border-border bg-secondary/50 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-secondary"
          >
            <Palette className="size-3.5 text-primary" />
            <span>Edit CMS</span>
          </Link>

          <a
            href={currentPath}
            target="_blank"
            rel="noreferrer"
            className="flex size-8 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            title="Open Page in New Tab"
          >
            <ExternalLink className="size-3.5" />
          </a>
        </div>
      </div>

      {/* Main Preview Stage */}
      <div className="relative flex min-h-[850px] items-center justify-center overflow-x-auto rounded-3xl border border-border/70 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black p-8">
        {/* Decorative Grid Pattern */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />

        {/* Device Container */}
        <div
          style={{
            width: `${activeWidth}px`,
            height: `${activeHeight}px`,
            transform: `scale(${zoom})`,
            transformOrigin: "center center",
          }}
          className={`relative shrink-0 overflow-hidden bg-background transition-all duration-300 ${selectedDevice.frameStyle}`}
        >
          {/* Phone Notch / Island (for phones) */}
          {selectedDevice.id !== "tablet" && !isLandscape && (
            <div className="pointer-events-none absolute left-1/2 top-2.5 z-50 flex h-6 -translate-x-1/2 items-center justify-between rounded-full bg-black px-4 shadow-md">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-white">{currentTime}</span>
              </div>
              <div className="ml-6 size-2.5 rounded-full bg-neutral-900 ring-1 ring-neutral-700" />
            </div>
          )}

          {/* Device Screen Iframe */}
          <iframe
            key={iframeKey}
            ref={iframeRef}
            src={currentPath}
            title="Nanami Kitchen Live Preview"
            className="h-full w-full border-0 bg-background"
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        {/* Floating Quick Control Badge */}
        <div className="absolute bottom-4 left-6 flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900/90 px-3.5 py-1.5 text-xs text-neutral-300 shadow-xl backdrop-blur">
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Synchronized Simulator</span>
          <span className="text-neutral-500">•</span>
          <span className="text-neutral-400 font-mono">
            {activeWidth} x {activeHeight}px
          </span>
        </div>
      </div>
    </div>
  );
}
