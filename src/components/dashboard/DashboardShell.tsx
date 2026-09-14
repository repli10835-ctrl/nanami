import type { ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  BarChart3,
  ClipboardList,
  Coins,
  LayoutDashboard,
  LayoutTemplate,
  ScrollText,
  Settings,
  Smartphone,
  Truck,
  ShieldCheck,
  Store,
  Ticket,
  UtensilsCrossed,
  Users,
} from "lucide-react";
import defaultLogo from "@/assets/nanami-logo.png";
import { useStore } from "@/lib/store";

export type DashboardRole = "admin" | "owner";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard };

const ADMIN_NAV: NavItem[] = [
  { to: "/admin", label: "Overview & Kitchen", icon: LayoutDashboard },
  { to: "/admin/menu", label: "Menu Catalog (CRUD)", icon: UtensilsCrossed },
  { to: "/admin/orders", label: "Daily Orders", icon: ClipboardList },
  { to: "/admin/stock", label: "Stock Availability", icon: UtensilsCrossed },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/owner/vouchers", label: "Promos & Vouchers", icon: Ticket },
  { to: "/owner/cms", label: "Content & CMS", icon: LayoutTemplate },
  { to: "/owner/outlets", label: "Outlets Directory", icon: Store },
  { to: "/owner/staff", label: "Accounts & Staff", icon: ShieldCheck },
  { to: "/owner/shipping", label: "Delivery Rates", icon: Truck },
  { to: "/admin/reports", label: "Reports & Analytics", icon: BarChart3 },
  { to: "/admin/settings", label: "Operations & Settings", icon: Settings },
];

const OWNER_NAV: NavItem[] = [
  { to: "/owner", label: "Overview", icon: LayoutDashboard },
  { to: "/owner/finance", label: "Finance", icon: Coins },
  { to: "/owner/menu", label: "Catalog", icon: UtensilsCrossed },
  { to: "/owner/cms", label: "Content CMS", icon: LayoutTemplate },
  { to: "/owner/preview", label: "Live Preview", icon: Smartphone },
  { to: "/owner/vouchers", label: "Promos & Vouchers", icon: Ticket },
  { to: "/owner/staff", label: "Accounts & Staff", icon: ShieldCheck },
  { to: "/owner/outlets", label: "Outlets", icon: Store },
  { to: "/owner/shipping", label: "Delivery Rates", icon: Truck },
  { to: "/owner/settings", label: "Store Settings", icon: Settings },
  { to: "/owner/audit", label: "Activity Logs", icon: ScrollText },
];

export function DashboardShell({
  role,
  title,
  subtitle,
  actions,
  children,
}: {
  role: DashboardRole;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const nav = role === "owner" ? OWNER_NAV : ADMIN_NAV;
  const roleLabel = role === "owner" ? "Owner" : "Admin";
  const { cms, settings } = useStore((s) => ({ cms: s.cms, settings: s.settings }));
  const { pathname } = useLocation();
  const displayLogo = cms?.logoUrl || defaultLogo;
  const storeName = settings?.storeName || "Nanami Kitchen";

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-border bg-popover/60 px-3 py-5 lg:flex">
        <div className="flex items-center gap-2 px-2">
          <img
            src={displayLogo}
            alt={storeName}
            width={32}
            height={32}
            className="size-8 rounded-lg object-contain"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold leading-tight">{storeName}</p>
            <p className="text-[11px] text-muted-foreground">Panel {roleLabel}</p>
          </div>
        </div>

        <nav suppressHydrationWarning className="mt-6 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => {
            const isActive =
              to === "/admin" || to === "/owner" ? pathname === to : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                suppressHydrationWarning
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-secondary/50"
                }`}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-1 px-1 pt-6 text-xs">
          <Link to={role === "owner" ? "/admin" : "/owner"} className="block text-muted-foreground">
            Switch to {role === "owner" ? "Admin" : "Owner"} panel
          </Link>
          <Link to="/" className="block text-muted-foreground">
            Back to customer app
          </Link>
        </div>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 px-3 sm:px-6 py-3 sm:py-4 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-lg sm:text-xl font-bold">{title}</h1>
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-primary shrink-0">
                  {roleLabel}
                </span>
              </div>
              {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
          </div>

          <div className="no-scrollbar -mx-3 sm:-mx-6 mt-2.5 flex gap-1.5 overflow-x-auto px-3 sm:px-6 lg:hidden">
            {nav.map(({ to, label }) => {
              const isActive =
                to === "/admin" || to === "/owner" ? pathname === to : pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs font-bold"
                      : "border border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </header>

        <main className="px-3 sm:px-6 py-4 sm:py-6 pb-20">{children}</main>
      </div>
    </div>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="glow-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="glow-card space-y-3 p-4">
      <div>
        <h2 className="text-sm font-semibold">{title}</h2>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export const fieldClass =
  "mt-1 w-full rounded-xl border border-input bg-secondary/40 px-3 py-2.5 text-sm outline-none focus:border-primary";
