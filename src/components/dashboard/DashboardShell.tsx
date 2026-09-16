import { useState, type ReactNode } from "react";
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
  Image as ImageIcon,
  PanelLeft,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
} from "lucide-react";
import defaultLogo from "@/assets/nanami-logo.png";
import { useStore } from "@/lib/store";

export type DashboardRole = "admin" | "owner" | "staff";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard };

const STAFF_NAV: NavItem[] = [
  { to: "/admin", label: "Kitchen Board", icon: LayoutDashboard },
  { to: "/admin/orders", label: "Order Management", icon: ClipboardList },
  { to: "/admin/stock", label: "Stock Availability", icon: UtensilsCrossed },
];

const ADMIN_NAV: NavItem[] = [
  { to: "/admin", label: "Kitchen Board", icon: LayoutDashboard },
  { to: "/admin/orders", label: "Order Management", icon: ClipboardList },
  { to: "/admin/menu", label: "Menu Catalog (CRUD)", icon: UtensilsCrossed },
  { to: "/admin/media", label: "Media Library", icon: ImageIcon },
  { to: "/admin/stock", label: "Stock Availability", icon: UtensilsCrossed },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/reports", label: "Reports & Analytics", icon: BarChart3 },
  { to: "/admin/settings", label: "Operations & Settings", icon: Settings },
];

const OWNER_NAV: NavItem[] = [
  { to: "/owner", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/orders", label: "Order Management", icon: ClipboardList },
  { to: "/owner/finance", label: "Finance", icon: Coins },
  { to: "/owner/menu", label: "Catalog", icon: UtensilsCrossed },
  { to: "/admin/media", label: "Media Library", icon: ImageIcon },
  { to: "/owner/cms", label: "Content CMS", icon: LayoutTemplate },
  { to: "/owner/preview", label: "Live Preview", icon: Smartphone },
  { to: "/owner/vouchers", label: "Vouchers & Promos", icon: Ticket },
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
  const { cms, settings, profile } = useStore((s) => ({
    cms: s.cms,
    settings: s.settings,
    profile: s.profile,
  }));
  const effectiveRole = profile.role === "staff" ? "staff" : role;
  const nav =
    effectiveRole === "staff" ? STAFF_NAV : effectiveRole === "owner" ? OWNER_NAV : ADMIN_NAV;
  const roleLabel =
    effectiveRole === "staff" ? "Kitchen Staff" : effectiveRole === "owner" ? "Owner" : "Admin";
  const { pathname } = useLocation();
  const displayLogo = cms?.logoUrl || defaultLogo;
  const storeName = settings?.storeName || "Nanami Kitchen";

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("nanami_sidebar_collapsed") === "true";
      } catch {
        return false;
      }
    }
    return false;
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("nanami_sidebar_collapsed", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Collapsible & Scrollable Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-border bg-popover/90 backdrop-blur-md transition-all duration-200 ease-in-out lg:flex ${
          collapsed ? "w-16 px-2 py-4" : "w-64 px-3.5 py-4"
        }`}
      >
        {/* Top Header: Logo + Title + Collapse Toggle */}
        <div
          className={`flex items-center gap-2 border-b border-border/40 pb-3.5 shrink-0 ${
            collapsed ? "justify-center flex-col gap-3" : "justify-between"
          }`}
        >
          <Link
            to={role === "owner" ? "/owner" : "/admin"}
            className="flex items-center gap-2.5 min-w-0"
            title={storeName}
          >
            <img
              src={displayLogo}
              alt={storeName}
              width={32}
              height={32}
              className="size-8 rounded-lg object-contain shrink-0"
            />
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold leading-tight">{storeName}</p>
                <p className="text-[11px] text-muted-foreground">Panel {roleLabel}</p>
              </div>
            )}
          </Link>

          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition shrink-0"
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </button>
        </div>

        {/* Scrollable Nav Container */}
        <nav
          suppressHydrationWarning
          className="sidebar-scroll my-3 flex-1 min-h-0 overflow-y-auto overflow-x-hidden space-y-1 pr-1"
        >
          {nav.map(({ to, label, icon: Icon }) => {
            const isActive =
              to === "/admin" || to === "/owner" ? pathname === to : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                suppressHydrationWarning
                title={collapsed ? label : undefined}
                className={`group flex items-center rounded-xl py-2.5 text-sm font-medium transition ${
                  collapsed ? "justify-center px-2" : "gap-2.5 px-3"
                } ${
                  isActive
                    ? "bg-primary/15 text-primary font-semibold shadow-xs"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                }`}
              >
                <Icon className={`size-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Switch/Exit Links */}
        <div className="shrink-0 border-t border-border/40 pt-3 text-xs space-y-1">
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <Link
                to={role === "owner" ? "/admin" : "/owner"}
                title={`Switch to ${role === "owner" ? "Admin" : "Owner"} panel`}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition"
              >
                <ShieldCheck className="size-4" />
              </Link>
              <Link
                to="/"
                title="Back to customer storefront"
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition"
              >
                <Store className="size-4" />
              </Link>
            </div>
          ) : (
            <>
              <Link
                to={role === "owner" ? "/admin" : "/owner"}
                className="block truncate text-muted-foreground hover:text-foreground transition"
              >
                &larr; Switch to {role === "owner" ? "Admin" : "Owner"} panel
              </Link>
              <Link
                to="/"
                className="block truncate text-muted-foreground hover:text-foreground transition"
              >
                &larr; Back to customer storefront
              </Link>
            </>
          )}
        </div>
      </aside>

      {/* Mobile Drawer Overlay Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-popover px-4 py-4 shadow-2xl transition-transform duration-200 ease-in-out lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border/40 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <img
              src={displayLogo}
              alt={storeName}
              width={32}
              height={32}
              className="size-8 rounded-lg object-contain"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold leading-tight">{storeName}</p>
              <p className="text-[11px] text-muted-foreground">Panel {roleLabel}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav
          suppressHydrationWarning
          className="sidebar-scroll my-3 flex-1 min-h-0 overflow-y-auto space-y-1 pr-1"
        >
          {nav.map(({ to, label, icon: Icon }) => {
            const isActive =
              to === "/admin" || to === "/owner" ? pathname === to : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                suppressHydrationWarning
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-primary/15 text-primary font-semibold shadow-xs"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                }`}
              >
                <Icon className={`size-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-border/40 pt-3 text-xs space-y-1.5">
          <Link
            to={role === "owner" ? "/admin" : "/owner"}
            onClick={() => setMobileOpen(false)}
            className="block truncate text-muted-foreground hover:text-foreground transition"
          >
            &larr; Switch to {role === "owner" ? "Admin" : "Owner"} panel
          </Link>
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="block truncate text-muted-foreground hover:text-foreground transition"
          >
            &larr; Back to customer storefront
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={`transition-all duration-200 ease-in-out ${collapsed ? "lg:pl-16" : "lg:pl-64"}`}
      >
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 px-3 sm:px-6 py-3 sm:py-4 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {/* Mobile hamburger menu toggle */}
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation menu"
                className="flex lg:hidden items-center justify-center size-9 rounded-xl border border-border bg-secondary/40 text-foreground hover:bg-secondary transition shrink-0"
              >
                <Menu className="size-4" />
              </button>

              {/* Desktop sidebar collapse toggle */}
              <button
                type="button"
                onClick={toggleSidebar}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                className="hidden lg:flex items-center justify-center size-9 rounded-xl border border-border bg-secondary/40 text-foreground hover:bg-secondary transition shrink-0"
              >
                {collapsed ? (
                  <PanelLeftOpen className="size-4" />
                ) : (
                  <PanelLeft className="size-4" />
                )}
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-lg sm:text-xl font-bold">{title}</h1>
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-primary shrink-0">
                    {roleLabel}
                  </span>
                </div>
                {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
              </div>
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
