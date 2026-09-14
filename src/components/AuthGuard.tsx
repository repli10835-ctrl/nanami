import { ReactNode, useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ChefHat, Crown, LogIn, ShieldAlert, ShoppingBag, Store } from "lucide-react";
import logo from "@/assets/nanami-logo.png";
import { actions, useStore } from "@/lib/store";

const PUBLIC_AUTH_PATHS = ["/login", "/register", "/auth"];

export function AuthGuard({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const profile = useStore((s) => s.profile);
  const [mounted, setMounted] = useState(false);

  const isAuthPage = PUBLIC_AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  useEffect(() => {
    setMounted(true);

    if (isAuthPage) return;

    if (!profile.signedIn) {
      const targetSearch = pathname && pathname !== "/" ? { redirect: pathname } : undefined;
      navigate({
        to: "/login",
        search: targetSearch,
        replace: true,
      });
      return;
    }

    if (pathname.startsWith("/owner") && profile.role !== "owner") {
      navigate({ to: "/admin", replace: true });
      return;
    }

    if (pathname.startsWith("/admin") && profile.role === "user") {
      navigate({ to: "/", replace: true });
      return;
    }
  }, [isAuthPage, profile.signedIn, profile.role, pathname, navigate]);

  // If visiting login, register or auth, allow immediately
  if (isAuthPage) {
    return <>{children}</>;
  }

  // During SSR or initial client hydration (!mounted), always render children (<Outlet />)
  // so that the server rendered HTML and client hydration pass match 100% without mismatch.
  if (!mounted) {
    return <>{children}</>;
  }

  // Not signed in: redirect to login and prevent viewing protected pages
  if (!profile.signedIn) {
    return <UnauthenticatedGate pathname={pathname} />;
  }

  // Role authorization checks
  if (pathname.startsWith("/owner") && profile.role !== "owner") {
    return <RoleUnauthorizedGate requiredRole="owner" currentRole={profile.role ?? "user"} />;
  }

  if (pathname.startsWith("/admin") && profile.role === "user") {
    return <RoleUnauthorizedGate requiredRole="admin" currentRole="user" />;
  }

  return <>{children}</>;
}

function UnauthenticatedGate({ pathname }: { pathname: string }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically redirect to /login with redirect target
    const targetSearch = pathname && pathname !== "/" ? { redirect: pathname } : undefined;
    navigate({
      to: "/login",
      search: targetSearch,
      replace: true,
    });
  }, [pathname, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mx-auto max-w-sm rounded-3xl border border-border bg-card p-6 shadow-xl">
        <img src={logo} alt="Nanami Kitchen" width={64} height={64} className="mx-auto size-16" />
        <h2 className="mt-4 text-xl font-bold">Harap Masuk Terlebih Dahulu</h2>
        <p className="mt-2 text-xs text-muted-foreground">
          Untuk menjaga keamanan pesanan dan data dapur, seluruh halaman Nanami Kitchen hanya dapat
          diakses setelah login.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <Link
            to="/login"
            search={pathname !== "/" ? { redirect: pathname } : undefined}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-95"
          >
            <LogIn className="size-4" /> Masuk Sekarang
          </Link>
          <Link
            to="/register"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-secondary/40 py-2.5 text-xs font-semibold text-foreground hover:bg-secondary/70"
          >
            Buat Akun Baru
          </Link>
        </div>

        <div className="mt-6 border-t border-border pt-4">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            Atau Masuk Cepat Akun Demo:
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
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
}: {
  requiredRole: "admin" | "owner";
  currentRole: string;
}) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mx-auto max-w-sm rounded-3xl border border-border bg-card p-6 shadow-xl">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-500/15 text-amber-500">
          <ShieldAlert className="size-6" />
        </div>
        <h2 className="mt-4 text-lg font-bold">
          Akses Khusus {requiredRole === "owner" ? "Owner" : "Admin / Staf"}
        </h2>
        <p className="mt-2 text-xs text-muted-foreground">
          Akun Anda saat ini ({currentRole}) tidak memiliki izin untuk membuka halaman{" "}
          {requiredRole}.
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={() => {
              actions.loginAsDemo(requiredRole);
              navigate({ to: `/${requiredRole}` });
            }}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-95"
          >
            {requiredRole === "owner" ? (
              <Crown className="size-4" />
            ) : (
              <ChefHat className="size-4" />
            )}
            Beralih ke Demo {requiredRole.toUpperCase()}
          </button>

          <Link
            to="/"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-secondary/40 py-2.5 text-xs font-semibold text-foreground hover:bg-secondary/70"
          >
            <Store className="size-3.5" /> Kembali ke Menu Pembeli
          </Link>

          <button
            onClick={() => {
              actions.signOut();
              navigate({ to: "/login" });
            }}
            className="mt-1 text-xs text-muted-foreground hover:text-foreground"
          >
            Ganti Akun Lain (Keluar)
          </button>
        </div>
      </div>
    </div>
  );
}
