import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  ClipboardList,
  Coins,
  LayoutDashboard,
  ScrollText,
  Settings,
  Truck,
  ShieldCheck,
  Store,
  Ticket,
  UtensilsCrossed,
  Users,
} from "lucide-react";
import logo from "@/assets/nanami-logo.png";

export type DashboardRole = "admin" | "owner";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard };

const ADMIN_NAV: NavItem[] = [
  { to: "/admin", label: "Papan Dapur", icon: LayoutDashboard },
  { to: "/admin/orders", label: "Pesanan Harian", icon: ClipboardList },
  { to: "/admin/stock", label: "Stok Menu", icon: UtensilsCrossed },
  { to: "/admin/customers", label: "Pelanggan", icon: Users },
  { to: "/admin/reports", label: "Laporan", icon: BarChart3 },
  { to: "/admin/settings", label: "Operasional", icon: Settings },
];

const OWNER_NAV: NavItem[] = [
  { to: "/owner", label: "Ringkasan", icon: LayoutDashboard },
  { to: "/owner/finance", label: "Keuangan", icon: Coins },
  { to: "/owner/menu", label: "Katalog", icon: UtensilsCrossed },
  { to: "/owner/vouchers", label: "Promo & Voucher", icon: Ticket },
  { to: "/owner/staff", label: "Akun & Staf", icon: ShieldCheck },
  { to: "/owner/outlets", label: "Outlet", icon: Store },
  { to: "/owner/shipping", label: "Tarif Ongkir", icon: Truck },
  { to: "/owner/settings", label: "Pengaturan Toko", icon: Settings },
  { to: "/owner/audit", label: "Log Aktivitas", icon: ScrollText },
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

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-border bg-popover/60 px-3 py-5 lg:flex">
        <div className="flex items-center gap-2 px-2">
          <img src={logo} alt="Nanami Kitchen" width={32} height={32} className="size-8" />
          <div>
            <p className="text-sm font-bold leading-tight">Nanami Kitchen</p>
            <p className="text-[11px] text-muted-foreground">Panel {roleLabel}</p>
          </div>
        </div>

        <nav className="mt-6 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/admin" || to === "/owner" }}
              activeProps={{ className: "bg-primary/15 text-primary" }}
              inactiveProps={{ className: "text-muted-foreground hover:bg-secondary/50" }}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium"
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-1 px-1 pt-6 text-xs">
          <Link to={role === "owner" ? "/admin" : "/owner"} className="block text-muted-foreground">
            Buka panel {role === "owner" ? "Admin" : "Owner"}
          </Link>
          <Link to="/" className="block text-muted-foreground">
            Kembali ke aplikasi pembeli
          </Link>
        </div>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 px-4 py-4 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{title}</h1>
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  {roleLabel}
                </span>
              </div>
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
            {actions}
          </div>

          <div className="no-scrollbar -mx-1 mt-3 flex gap-2 overflow-x-auto px-1 lg:hidden">
            {nav.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: to === "/admin" || to === "/owner" }}
                activeProps={{ className: "bg-primary text-primary-foreground" }}
                inactiveProps={{
                  className: "border border-border bg-secondary/40 text-muted-foreground",
                }}
                className="shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold"
              >
                {label}
              </Link>
            ))}
          </div>
        </header>

        <main className="px-4 py-5 pb-16">{children}</main>
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
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
