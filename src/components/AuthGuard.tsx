import { ReactNode, useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  ChefHat,
  Crown,
  LogIn,
  ShieldAlert,
  ShoppingBag,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import logo from "@/assets/nanami-logo.png";
import { actions, useStore } from "@/lib/store";

const PUBLIC_AUTH_PATHS = ["/login", "/register", "/auth"];

function isCustomerRestrictedPath(pathname: string): boolean {
  return (
    pathname === "/profile" ||
    pathname.startsWith("/profile/") ||
    pathname === "/orders" ||
    pathname.startsWith("/orders/") ||
    pathname === "/saved-address" ||
    pathname.startsWith("/saved-address/")
  );
}

function isOperationalAdminPath(pathname: string): boolean {
  return (
    pathname === "/admin" ||
    pathname === "/admin/" ||
    pathname === "/admin/orders" ||
    pathname.startsWith("/admin/orders/") ||
    pathname === "/admin/stock" ||
    pathname.startsWith("/admin/stock/")
  );
}

function isOwnerOnlyAdminPath(pathname: string): boolean {
  return (
    pathname === "/admin/menu" ||
    pathname.startsWith("/admin/menu/") ||
    pathname === "/admin/media" ||
    pathname.startsWith("/admin/media/") ||
    pathname === "/admin/customers" ||
    pathname.startsWith("/admin/customers/") ||
    pathname === "/admin/reports" ||
    pathname.startsWith("/admin/reports/") ||
    pathname === "/admin/settings" ||
    pathname.startsWith("/admin/settings/")
  );
}

function isStaffOrAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function isOwnerPath(pathname: string): boolean {
  return pathname === "/owner" || pathname.startsWith("/owner/");
}

export function AuthGuard({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const profile = useStore((s) => s.profile);
  const [mounted, setMounted] = useState(false);

  const isAuthPage = PUBLIC_AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isOwnerArea = isOwnerPath(pathname);
  const isAdminArea = isStaffOrAdminPath(pathname);
  const isCustomerMemberArea = isCustomerRestrictedPath(pathname);

  useEffect(() => {
    setMounted(true);

    if (isAuthPage) return;

    // 1. Owner pages check: strictly role "owner" only
    if (isOwnerArea) {
      if (!profile.signedIn) {
        navigate({ to: "/login", search: { redirect: pathname }, replace: true });
        return;
      }
      if (profile.role !== "owner") {
        navigate({ to: "/admin", replace: true });
        return;
      }
      return;
    }

    // 2. Admin / Kitchen pages check: staff, admin, and owner
    if (isAdminArea) {
      if (!profile.signedIn) {
        navigate({ to: "/login", search: { redirect: pathname }, replace: true });
        return;
      }
      if (profile.role === "user") {
        navigate({ to: "/", replace: true });
        return;
      }

      // Check owner-only modules (Menu CRUD, Media Library, Customers, Reports, Settings)
      if (isOwnerOnlyAdminPath(pathname)) {
        if (profile.role !== "owner") {
          // Strictly forbid role admin & staff from accessing owner-only tools
          navigate({ to: "/admin", replace: true });
          return;
        } else {
          // If owner accesses legacy admin paths, route them seamlessly to owner counterparts
          if (pathname === "/admin/menu" || pathname.startsWith("/admin/menu/")) {
            navigate({ to: "/owner/menu", replace: true });
            return;
          }
          if (pathname === "/admin/media" || pathname.startsWith("/admin/media/")) {
            navigate({ to: "/owner/media", replace: true });
            return;
          }
          if (pathname === "/admin/customers" || pathname.startsWith("/admin/customers/")) {
            navigate({ to: "/owner/customers", replace: true });
            return;
          }
          if (pathname === "/admin/reports" || pathname.startsWith("/admin/reports/")) {
            navigate({ to: "/owner/finance", replace: true });
            return;
          }
          if (pathname === "/admin/settings" || pathname.startsWith("/admin/settings/")) {
            navigate({ to: "/owner/settings", replace: true });
            return;
          }
        }
      }

      // Granular protection: role staff & admin are restricted strictly to operational tools
      if (
        (profile.role === "staff" || profile.role === "admin") &&
        !isOperationalAdminPath(pathname)
      ) {
        navigate({ to: "/admin", replace: true });
        return;
      }
      return;
    }

    // 3. Customer member-only pages (Profile, Orders, Saved Address)
    if (isCustomerMemberArea && !profile.signedIn) {
      navigate({ to: "/login", search: { redirect: pathname }, replace: true });
      return;
    }
  }, [
    isAuthPage,
    isOwnerArea,
    isAdminArea,
    isCustomerMemberArea,
    profile.signedIn,
    profile.role,
    pathname,
    navigate,
  ]);

  // If visiting login, register or auth, allow immediately
  if (isAuthPage) {
    return <>{children}</>;
  }

  // During SSR or initial client hydration (!mounted), always render children (<Outlet />)
  // so that the server rendered HTML and client hydration pass match 100% without mismatch.
  if (!mounted) {
    return <>{children}</>;
  }

  // Check Owner access (strictly owner only)
  if (isOwnerArea) {
    if (!profile.signedIn) {
      return <UnauthenticatedGate pathname={pathname} title="Owner Portal Access" />;
    }
    if (profile.role !== "owner") {
      return (
        <RoleUnauthorizedGate
          requiredRole="owner"
          currentRole={profile.role ?? "user"}
          message="Executive financials, staff assignments, and store settings are restricted to Owner access."
        />
      );
    }
  }

  // Check Admin / Staff access
  if (isAdminArea) {
    if (!profile.signedIn) {
      return <UnauthenticatedGate pathname={pathname} title="Kitchen & Admin Portal Access" />;
    }
    if (profile.role === "user") {
      return <RoleUnauthorizedGate requiredRole="admin" currentRole="user" />;
    }

    // Granular protection: owner-only tools inside admin
    if (isOwnerOnlyAdminPath(pathname) && profile.role !== "owner") {
      return (
        <RoleUnauthorizedGate
          requiredRole="owner"
          currentRole={profile.role ?? "admin"}
          message="Catalog CRUD, Media Library, Customers, Financial Reports, and Store Settings are restricted to Owner role only. Operational Admin & Staff have access to Kitchen Board, Order Management, and Stock Availability."
        />
      );
    }

    // Protection for staff and admin roles:
    if (
      (profile.role === "staff" || profile.role === "admin") &&
      !isOperationalAdminPath(pathname)
    ) {
      return (
        <RoleUnauthorizedGate
          requiredRole="owner"
          currentRole={profile.role ?? "admin"}
          message="This page requires Owner privileges. Kitchen Admin and Staff have access to the Kitchen Board, Order Management, and Stock Availability."
        />
      );
    }
  }

  // Check Customer member-only pages
  if (isCustomerMemberArea && !profile.signedIn) {
    return <UnauthenticatedGate pathname={pathname} title="Member Account Required" />;
  }

  // All other customer routes (/, /menu, /cart, /checkout, /order-success, /tracking, /address, /vouchers) are 100% public
  return <>{children}</>;
}

function UnauthenticatedGate({ pathname, title }: { pathname: string; title?: string }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically redirect to /login with redirect target
    if (pathname && pathname !== "/") {
      navigate({
        to: "/login",
        search: { redirect: pathname },
        replace: true,
      });
    } else {
      navigate({
        to: "/login",
        replace: true,
      });
    }
  }, [pathname, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mx-auto max-w-sm rounded-3xl border border-border bg-card p-6 shadow-xl">
        <img src={logo} alt="Nanami Kitchen" width={64} height={64} className="mx-auto size-16" />
        <h2 className="mt-4 text-xl font-bold">{title || "Please Sign In First"}</h2>
        <p className="mt-2 text-xs text-muted-foreground">
          Sign in to access your saved profile and loyalty account, or explore our menu as a guest.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          {pathname && pathname !== "/" ? (
            <Link
              to="/login"
              search={{ redirect: pathname }}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-95"
            >
              <LogIn className="size-4" /> Sign In Now
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-95"
            >
              <LogIn className="size-4" /> Sign In Now
            </Link>
          )}
          <Link
            to="/"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-secondary/40 py-2.5 text-xs font-semibold text-foreground hover:bg-secondary/70"
          >
            <Store className="size-3.5" /> Continue as Guest (Storefront)
          </Link>
          <Link to="/register" className="text-xs text-muted-foreground hover:text-foreground pt-1">
            Don't have an account? Register
          </Link>
        </div>

        <div className="mt-6 border-t border-border pt-4">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            Or Quick Switch Demo Account:
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <button
              onClick={() => {
                actions.loginAsDemo("user");
                navigate({ to: "/" });
              }}
              className="flex flex-col items-center gap-1 rounded-xl border border-border bg-secondary/30 p-2.5 text-center transition hover:bg-secondary/60"
            >
              <ShoppingBag className="size-4 text-primary" />
              <span className="text-[11px] font-bold">User</span>
            </button>
            <button
              onClick={() => {
                actions.loginAsDemo("staff");
                navigate({ to: "/admin" });
              }}
              className="flex flex-col items-center gap-1 rounded-xl border border-border bg-secondary/30 p-2.5 text-center transition hover:bg-secondary/60"
            >
              <UtensilsCrossed className="size-4 text-primary" />
              <span className="text-[11px] font-bold">Staff</span>
            </button>
            <button
              onClick={() => {
                actions.loginAsDemo("admin");
                navigate({ to: "/admin" });
              }}
              className="flex flex-col items-center gap-1 rounded-xl border border-border bg-secondary/30 p-2.5 text-center transition hover:bg-secondary/60"
            >
              <ChefHat className="size-4 text-primary" />
              <span className="text-[11px] font-bold">Admin</span>
            </button>
            <button
              onClick={() => {
                actions.loginAsDemo("owner");
                navigate({ to: "/owner" });
              }}
              className="flex flex-col items-center gap-1 rounded-xl border border-border bg-secondary/30 p-2.5 text-center transition hover:bg-secondary/60"
            >
              <Crown className="size-4 text-primary" />
              <span className="text-[11px] font-bold">Owner</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RoleUnauthorizedGate({
  requiredRole,
  currentRole,
  message,
}: {
  requiredRole: "admin" | "owner";
  currentRole: string;
  message?: string;
}) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mx-auto max-w-sm rounded-3xl border border-border bg-card p-6 shadow-xl">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-500/15 text-amber-500">
          <ShieldAlert className="size-6" />
        </div>
        <h2 className="mt-4 text-lg font-bold">
          Restricted to {requiredRole === "owner" ? "Owner" : "Admin / Staff"} Access
        </h2>
        <p className="mt-2 text-xs text-muted-foreground">
          {message ||
            `Your current account (${currentRole}) does not have permission to access ${requiredRole} pages.`}
        </p>

        <div className="mt-6 flex flex-col gap-2">
          {(currentRole === "staff" || currentRole === "admin") && (
            <button
              onClick={() => {
                navigate({ to: "/admin" });
              }}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-95"
            >
              <UtensilsCrossed className="size-4" /> Go to Kitchen & Orders
            </button>
          )}

          <button
            onClick={() => {
              actions.loginAsDemo(requiredRole);
              navigate({ to: `/${requiredRole}` });
            }}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-secondary/40 py-2.5 text-xs font-semibold text-foreground hover:bg-secondary/70"
          >
            {requiredRole === "owner" ? (
              <Crown className="size-4 text-primary" />
            ) : (
              <ChefHat className="size-4 text-primary" />
            )}
            Switch to Demo {requiredRole.toUpperCase()}
          </button>

          <Link
            to="/"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-secondary/40 py-2.5 text-xs font-semibold text-foreground hover:bg-secondary/70"
          >
            <Store className="size-3.5" /> Return to Customer Store
          </Link>

          <button
            onClick={() => {
              actions.signOut();
              navigate({ to: "/login" });
            }}
            className="mt-1 text-xs text-muted-foreground hover:text-foreground"
          >
            Sign Out & Switch Account
          </button>
        </div>
      </div>
    </div>
  );
}
