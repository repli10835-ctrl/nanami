import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import logo from "@/assets/nanami-logo.png";
import { AppShell } from "@/components/AppShell";
import { actions, useStore } from "@/lib/store";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Daftar Akun Baru — Nanami Kitchen" },
      {
        name: "description",
        content:
          "Buat akun Nanami Kitchen dengan email dan password. Simpan nama, nomor WhatsApp, dan alamat pengiriman untuk checkout lebih cepat.",
      },
      { property: "og:title", content: "Daftar Akun — Nanami Kitchen" },
      {
        property: "og:description",
        content: "Daftar dengan email dan password untuk checkout lebih cepat.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RegisterPage,
});

const field =
  "mt-1 w-full rounded-xl border border-input bg-secondary/40 px-3 py-2.5 text-sm outline-none focus:border-primary";

function RegisterPage() {
  const navigate = useNavigate();
  const profile = useStore((s) => s.profile);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (name.trim().length < 2) {
      setError("Nama lengkap minimal 2 karakter.");
      return;
    }
    if (!/^[0-9+\-\s()]{8,20}$/.test(phone.trim())) {
      setError("Nomor WhatsApp tidak valid.");
      return;
    }
    if (password !== confirm) {
      setError("Konfirmasi password tidak sama.");
      return;
    }
    const result = actions.signUp({ name, email, phone, password });
    if (!result.ok) {
      setError(result.error ?? "Terjadi kesalahan.");
      return;
    }
    const clean = address.trim();
    if (clean) {
      actions.updateProfile({ address: clean });
      actions.saveAddress(clean);
    }
    navigate({ to: "/profile" });
  }

  if (profile.signedIn) {
    return (
      <AppShell hideCartBar>
        <div className="py-16 text-center">
          <h1 className="text-xl font-bold">Kamu sudah punya akun aktif</h1>
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
        <h1 className="text-2xl font-bold">Daftar</h1>
      </div>

      <img
        src={logo}
        alt="Logo Nanami Kitchen"
        width={64}
        height={64}
        className="mx-auto mt-8 size-16"
      />
      <p className="mt-3 text-center text-sm text-muted-foreground">
        Buat akun untuk checkout lebih cepat dan kumpulkan poin setiap pesanan.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-3">
        <label className="block text-xs text-muted-foreground">
          Nama lengkap
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            maxLength={100}
            required
            className={field}
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          Nomor WhatsApp
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
            autoComplete="tel"
            maxLength={20}
            required
            className={field}
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          Alamat pengiriman (opsional)
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            maxLength={300}
            className={`${field} resize-none`}
          />
        </label>
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
          Password (min. 6 karakter)
          <span className="relative block">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={show ? "text" : "password"}
              autoComplete="new-password"
              minLength={6}
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
        <label className="block text-xs text-muted-foreground">
          Ulangi password
          <input
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            type={show ? "text" : "password"}
            autoComplete="new-password"
            minLength={6}
            maxLength={72}
            required
            className={field}
          />
        </label>

        {error && (
          <p className="rounded-lg bg-destructive/15 px-3 py-2 text-xs text-destructive">{error}</p>
        )}

        <button
          type="submit"
          disabled={!email || !password || !confirm || !name || !phone}
          className="!mt-6 w-full rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-40"
        >
          Buat akun
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Sudah punya akun?{" "}
        <Link to="/login" className="font-semibold text-primary">
          Masuk di sini
        </Link>
      </p>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Akun kamu tersimpan di perangkat ini saja.
      </p>
    </AppShell>
  );
}
