import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChefHat, Crown, ShoppingBag, X, Eye } from "lucide-react";

const ROLES = [
  { to: "/", label: "Pembeli", icon: ShoppingBag, match: (p: string) => !p.startsWith("/admin") && !p.startsWith("/owner") },
  { to: "/admin", label: "Admin", icon: ChefHat, match: (p: string) => p.startsWith("/admin") },
  { to: "/owner", label: "Owner", icon: Crown, match: (p: string) => p.startsWith("/owner") },
] as const;

export function RoleSwitcher() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(true);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Tampilkan pengalih tampilan role"
        className="fixed bottom-24 right-3 z-50 rounded-full border border-border bg-popover/95 p-2.5 text-muted-foreground shadow-lg backdrop-blur"
      >
        <Eye className="size-4" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 right-3 z-50 rounded-2xl border border-border bg-popover/95 p-2 shadow-lg backdrop-blur">
      <div className="mb-1.5 flex items-center justify-between gap-2 px-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Mode pratinjau
        </p>
        <button
          onClick={() => setOpen(false)}
          aria-label="Sembunyikan pengalih role"
          className="text-muted-foreground"
        >
          <X className="size-3.5" />
        </button>
      </div>
      <div className="flex gap-1.5">
        {ROLES.map((r) => {
          const active = r.match(pathname);
          return (
            <Link
              key={r.to}
              to={r.to}
              className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-[11px] font-semibold ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/60 text-muted-foreground"
              }`}
            >
              <r.icon className="size-4" />
              {r.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
