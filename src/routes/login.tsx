import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import logo from "@/assets/nanami-logo.png";
import { AppShell } from "@/components/AppShell";
import { actions, useStore } from "@/lib/store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Masuk Akun — Nanami Kitchen" },
      {
        name: "description",
        content:
          "Masuk ke akun Nanami Kitchen dengan email dan password untuk melacak pesanan, menyimpan alamat, dan mengumpulkan poin.",
      },
      { property: "og:title", content: "Masuk Akun — Nanami Kitchen" },
      {
        property: "og:description",
        content: "Masuk dengan email dan password untuk melacak pesanan dan poin loyalitas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

const field =
  "mt-1 w-full rounded-xl border border-input bg-secondary/40 px-3 py-2.5 text-sm outline-none focus:border-primary";

function LoginPage() {
  const navigate = useNavigate();
  const profile = useStore((s) => s.profile);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const result = actions.signIn(email, password);
    if (!result.ok) {
      setError(result.error ?? "Terjadi kesalahan.");
      return;
    }
    navigate({ to: "/profile" });
  }

  if (profile.signedIn) {
    return (
      <AppShell hideCartBar>
        <div className="py-16 text-center">
          <h1 className="text-xl font-bold">Kamu sudah masuk</h1>
          <p className="mt-2 text-sm text-muted-foreground">Masuk sebagai {profile.email}</p>
          <Link
            to="/profile"
            className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
          >
            Buka profil
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell hideCartBar>
      <div className="flex items-center gap-4">
        <Link to="/" aria-label="Kembali" className="text-foreground">
          <ArrowLeft className="size-6" />
        </Link>
        <h1 className="text-2xl font-bold">Masuk</h1>
      </div>

      <img
        src={logo}
        alt="Logo Nanami Kitchen"
        width={64}
        height={64}
        className="mx-auto mt-8 size-16"
      />
      <p className="mt-3 text-center text-sm text-muted-foreground">
        Masuk untuk melacak pesanan, menyimpan alamat, dan mengumpulkan poin.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-3">
        <label className="block text-xs text-muted-foreground">
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            maxLength={255}
            required
            className={field}
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          Password
          <span className="relative block">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={show ? "text" : "password"}
              autoComplete="current-password"
              maxLength={72}
              required
              className={`${field} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </span>
        </label>

        {error && (
          <p className="rounded-lg bg-destructive/15 px-3 py-2 text-xs text-destructive">{error}</p>
        )}

        <button
          type="submit"
          disabled={!email || !password}
          className="!mt-6 w-full rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-40"
        >
          Masuk
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Belum punya akun?{" "}
        <Link to="/register" className="font-semibold text-primary">
          Daftar sekarang
        </Link>
      </p>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Akun kamu tersimpan di perangkat ini saja.
      </p>
    </AppShell>
  );
}
