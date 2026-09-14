import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChefHat,
  Crown,
  Eye,
  EyeOff,
  LogIn,
  LogOut,
  ShoppingBag,
  Sparkles,
  Zap,
} from "lucide-react";
import defaultLogo from "@/assets/nanami-logo.png";
import { AppShell } from "@/components/AppShell";
import { DEMO_ACCOUNTS, actions, useStore } from "@/lib/store";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign In — Nanami Kitchen" },
      {
        name: "description",
        content:
          "Sign in to your Nanami Kitchen account with email and password to track orders, save addresses, and earn points.",
      },
      { property: "og:title", content: "Sign In — Nanami Kitchen" },
      {
        property: "og:description",
        content: "Sign in with email and password to track orders and loyalty points.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

const field =
  "mt-1 w-full rounded-xl border border-input bg-secondary/40 px-3 py-2.5 text-sm outline-none focus:border-primary transition";

function LoginPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const { profile, cms, settings } = useStore((s) => ({
    profile: s.profile,
    cms: s.cms,
    settings: s.settings,
  }));
  const displayLogo = cms?.logoUrl || defaultLogo;
  const storeName = settings?.storeName || "Nanami Kitchen";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  function handleDirectRoute(role?: "user" | "admin" | "owner") {
    if (role === "owner") {
      navigate({ to: redirect && redirect.startsWith("/owner") ? redirect : "/owner" });
    } else if (role === "admin") {
      navigate({ to: redirect && redirect.startsWith("/admin") ? redirect : "/admin" });
    } else {
      navigate({
        to:
          redirect && !redirect.startsWith("/admin") && !redirect.startsWith("/owner")
            ? redirect
            : "/",
      });
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const result = actions.signIn(email, password);
    if (!result.ok) {
      setError(result.error ?? "Terjadi kesalahan.");
      return;
    }
    handleDirectRoute(result.role);
  }

  function handleQuickDemoLogin(role: "user" | "admin" | "owner") {
    setError("");
    const res = actions.loginAsDemo(role);
    if (res.ok) {
      handleDirectRoute(res.role);
    } else {
      setError(res.error ?? "Gagal masuk dengan akun demo.");
    }
  }

  function handleFillDemo(accountEmail: string, accountPass: string) {
    setEmail(accountEmail);
    setPassword(accountPass);
    setError("");
  }

  if (profile.signedIn) {
    const roleLabel =
      profile.role === "owner" ? "Owner" : profile.role === "admin" ? "Kitchen Admin" : "Customer";

    return (
      <AppShell hideCartBar hideBottomNav>
        <div className="mx-auto max-w-md py-12 text-center">
          <div className="mx-auto grid size-20 place-items-center rounded-full bg-primary/15 text-primary ring-2 ring-primary/30">
            {profile.role === "owner" ? (
              <Crown className="size-10" />
            ) : profile.role === "admin" ? (
              <ChefHat className="size-10" />
            ) : (
              <ShoppingBag className="size-10" />
            )}
          </div>
          <h1 className="mt-4 text-2xl font-bold">You are Already Signed In</h1>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" />
            <span>{roleLabel}</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{profile.name || profile.email}</p>
          <p className="text-xs text-muted-foreground">{profile.email}</p>

          <div className="mt-6 flex flex-col gap-2.5">
            <button
              onClick={() => handleDirectRoute(profile.role)}
              className="w-full rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-sm transition hover:opacity-95"
            >
              Continue to Home Page
            </button>
            <button
              onClick={() => {
                actions.signOut();
                setEmail("");
                setPassword("");
              }}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-secondary/30 py-3 text-sm font-semibold text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            >
              <LogOut className="size-4" /> Switch Account / Sign Out
            </button>
          </div>

          <div className="mt-10 border-t border-border pt-6 text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Or Switch to Another Demo Account:
            </p>
            <div className="mt-3 grid gap-2.5">
              {DEMO_ACCOUNTS.filter(
                (d) => d.email.toLowerCase() !== profile.email.toLowerCase(),
              ).map((demo) => (
                <button
                  key={demo.id}
                  onClick={() => handleQuickDemoLogin(demo.role ?? "user")}
                  className="flex items-center justify-between rounded-2xl border border-border bg-card p-3 text-left transition hover:border-primary/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-secondary text-primary">
                      {demo.role === "owner" ? (
                        <Crown className="size-4" />
                      ) : demo.role === "admin" ? (
                        <ChefHat className="size-4" />
                      ) : (
                        <ShoppingBag className="size-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold">{demo.name}</p>
                      <p className="text-[11px] text-muted-foreground">{demo.email}</p>
                    </div>
                  </div>
                  <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">
                    Switch
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell hideCartBar hideBottomNav>
      <div className="mx-auto max-w-md pb-8">
        <div className="text-center">
          <img
            src={displayLogo}
            alt={storeName}
            width={64}
            height={64}
            className="mx-auto size-16 rounded-2xl object-contain drop-shadow"
          />
          <h1 className="mt-3 text-2xl font-bold tracking-tight">Sign In to {storeName}</h1>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Please sign in to access menu items, cart, orders, or operational dashboard.
          </p>
        </div>

        {/* Demo Accounts Section */}
        <div className="mt-6 rounded-3xl border border-primary/20 bg-primary/[0.03] p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
              <Zap className="size-4 fill-primary" />
              <span>Quick Demo Accounts (1-Click Login)</span>
            </div>
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
              Ready
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Click a button below to quickly try the app with the selected role:
          </p>

          <div className="mt-3 space-y-2.5">
            {/* Demo User */}
            <div className="rounded-2xl border border-border/80 bg-card/90 p-3 shadow-sm transition hover:border-primary/40">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                    <ShoppingBag className="size-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">User / Customer</span>
                      <span className="rounded bg-blue-500/15 px-1.5 py-0.2 text-[10px] font-semibold text-blue-500">
                        Catalog & Orders
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      user@nanami.id &bull; pass:{" "}
                      <span className="font-mono text-foreground font-semibold">user123</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-2.5 flex items-center gap-2 pt-2 border-t border-border/50">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin("user")}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90"
                >
                  <LogIn className="size-3.5" /> Sign In as Customer
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo("user@nanami.id", "user123")}
                  className="rounded-xl border border-border bg-secondary/40 px-3 py-2 text-[11px] font-semibold text-muted-foreground hover:text-foreground"
                >
                  Fill Form
                </button>
              </div>
            </div>

            {/* Demo Admin */}
            <div className="rounded-2xl border border-border/80 bg-card/90 p-3 shadow-sm transition hover:border-primary/40">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                    <ChefHat className="size-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">Admin / Kitchen</span>
                      <span className="rounded bg-amber-500/15 px-1.5 py-0.2 text-[10px] font-semibold text-amber-500">
                        Kitchen Board
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      admin@nanami.id &bull; pass:{" "}
                      <span className="font-mono text-foreground font-semibold">admin123</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-2.5 flex items-center gap-2 pt-2 border-t border-border/50">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin("admin")}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90"
                >
                  <ChefHat className="size-3.5" /> Sign In as Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo("admin@nanami.id", "admin123")}
                  className="rounded-xl border border-border bg-secondary/40 px-3 py-2 text-[11px] font-semibold text-muted-foreground hover:text-foreground"
                >
                  Fill Form
                </button>
              </div>
            </div>

            {/* Demo Owner */}
            <div className="rounded-2xl border border-border/80 bg-card/90 p-3 shadow-sm transition hover:border-primary/40">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                    <Crown className="size-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">Owner</span>
                      <span className="rounded bg-purple-500/15 px-1.5 py-0.2 text-[10px] font-semibold text-purple-500">
                        Reports & Management
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      owner@nanami.id &bull; pass:{" "}
                      <span className="font-mono text-foreground font-semibold">owner123</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-2.5 flex items-center gap-2 pt-2 border-t border-border/50">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin("owner")}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-purple-600 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90"
                >
                  <Crown className="size-3.5" /> Sign In as Owner
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo("owner@nanami.id", "owner123")}
                  className="rounded-xl border border-border bg-secondary/40 px-3 py-2 text-[11px] font-semibold text-muted-foreground hover:text-foreground"
                >
                  Fill Form
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <span className="relative bg-background px-3 text-[11px] font-medium text-muted-foreground uppercase">
            Or Sign In with Email
          </span>
        </div>

        {/* Manual Login Form */}
        <form onSubmit={submit} className="space-y-3">
          <label className="block text-xs font-medium text-muted-foreground">
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="name@email.com or demo account above"
              autoComplete="email"
              maxLength={255}
              required
              className={field}
            />
          </label>
          <label className="block text-xs font-medium text-muted-foreground">
            Password
            <span className="relative block">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={show ? "text" : "password"}
                placeholder="Account password"
                autoComplete="current-password"
                maxLength={72}
                required
                className={`${field} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </span>
          </label>

          {error && (
            <p className="rounded-xl bg-destructive/15 px-3.5 py-2.5 text-xs text-destructive font-medium">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!email || !password}
            className="!mt-5 w-full rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-sm transition hover:opacity-95 disabled:opacity-40"
          >
            Sign In
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          Don't have an account yet?{" "}
          <Link to="/register" className="font-semibold text-primary underline underline-offset-2">
            Register new account
          </Link>
        </p>
      </div>
    </AppShell>
  );
}
