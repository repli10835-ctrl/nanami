import { useEffect, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { ChefHat, Crown, ShoppingBag, UtensilsCrossed, X, Zap } from "lucide-react";
import { actions, useStore } from "@/lib/store";

const ROLES = [
  {
    key: "user" as const,
    to: "/",
    label: "User",
    sublabel: "Customer",
    icon: ShoppingBag,
    match: (p: string) => !p.startsWith("/admin") && !p.startsWith("/owner"),
  },
  {
    key: "staff" as const,
    to: "/admin",
    label: "Staff",
    sublabel: "Kitchen",
    icon: UtensilsCrossed,
    match: (p: string) => p === "/admin" || p === "/admin/orders" || p === "/admin/stock",
  },
  {
    key: "admin" as const,
    to: "/admin",
    label: "Admin",
    sublabel: "Manager",
    icon: ChefHat,
    match: (p: string) =>
      p.startsWith("/admin") && p !== "/admin" && p !== "/admin/orders" && p !== "/admin/stock",
  },
  {
    key: "owner" as const,
    to: "/owner",
    label: "Owner",
    sublabel: "Executive",
    icon: Crown,
    match: (p: string) => p.startsWith("/owner"),
  },
] as const;

export function RoleSwitcher() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const profile = useStore((s) => s.profile);
  const [open, setOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid SSR / client hydration mismatch and don't show on dedicated login/register pages
  if (!mounted || pathname === "/login" || pathname === "/register") {
    return null;
  }

  function handleSelectRole(roleKey: "user" | "staff" | "admin" | "owner", to: string) {
    if (!profile.signedIn || profile.role !== roleKey) {
      actions.loginAsDemo(roleKey);
    }
    navigate({ to });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Show demo account switcher"
        className="fixed bottom-24 right-3 z-50 flex items-center gap-1.5 rounded-full border border-border bg-popover/95 px-3 py-2 text-xs font-semibold text-foreground shadow-lg backdrop-blur"
      >
        <Zap className="size-3.5 text-primary fill-primary" />
        <span className="capitalize">
          {profile.signedIn ? (profile.role ?? "Demo") : "Sign In"}
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 right-3 z-50 rounded-2xl border border-border bg-popover/95 p-2.5 shadow-xl backdrop-blur max-w-[320px]">
      <div className="mb-2 flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1 text-[11px] font-bold text-foreground">
          <Zap className="size-3.5 text-primary fill-primary" />
          <span>Quick Demo Accounts</span>
        </div>
        <button
          onClick={() => setOpen(false)}
          aria-label="Hide role switcher"
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {ROLES.map((r) => {
          const isCurrentRoute = r.match(pathname);
          const isCurrentRole = profile.signedIn && profile.role === r.key;
          const active = isCurrentRole || isCurrentRoute;

          return (
            <button
              key={r.key}
              type="button"
              onClick={() => handleSelectRole(r.key, r.to)}
              className={`flex flex-col items-center gap-1 rounded-xl p-2 text-center transition ${
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary/70 text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <r.icon className="size-4" />
              <span className="text-[11px] font-bold leading-tight">{r.label}</span>
              <span
                className={`text-[9px] leading-none ${
                  active ? "text-primary-foreground/80" : "text-muted-foreground"
                }`}
              >
                {r.sublabel}
              </span>
            </button>
          );
        })}
      </div>

      {profile.signedIn && (
        <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-1.5 px-1 text-[10px] text-muted-foreground">
          <span className="truncate max-w-[170px]">
            Logged in: <strong className="text-foreground">{profile.name.split(" ")[0]}</strong> (
            {profile.role})
          </span>
          <button
            type="button"
            onClick={() => {
              actions.signOut();
              navigate({ to: "/login" });
            }}
            className="text-primary hover:underline font-semibold"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
