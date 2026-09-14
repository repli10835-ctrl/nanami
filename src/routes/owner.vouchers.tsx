import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { DashboardShell, SectionCard, fieldClass } from "@/components/dashboard/DashboardShell";
import { actions, rupiah, uid, useStore } from "@/lib/store";

export const Route = createFileRoute("/owner/vouchers")({
  head: () => ({
    meta: [
      { title: "Promo & Voucher — Panel Owner Nanami Kitchen" },
      {
        name: "description",
        content: "Buat dan kelola voucher diskon serta banner promo Nanami Kitchen.",
      },
      { property: "og:title", content: "Promo & Voucher — Nanami Kitchen" },
      { property: "og:description", content: "Kelola voucher diskon dan banner promo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: VouchersPage,
});

function VouchersPage() {
  const vouchers = useStore((s) => s.vouchers);
  const promos = useStore((s) => s.promos);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState("");
  const [minSpend, setMinSpend] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [badge, setBadge] = useState("");

  return (
    <DashboardShell role="owner" title="Promo & Voucher" subtitle="Kebijakan diskon toko">
      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <SectionCard title="Buat voucher">
          <label className="block text-xs text-muted-foreground">
            Kode
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className={fieldClass}
            />
          </label>
          <label className="block text-xs text-muted-foreground">
            Tipe
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "percent" | "fixed")}
              className={fieldClass}
            >
              <option value="percent">Persen (%)</option>
              <option value="fixed">Potongan tetap (Rp)</option>
            </select>
          </label>
          <label className="block text-xs text-muted-foreground">
            Nilai
            <input
              value={value}
              inputMode="numeric"
              onChange={(e) => setValue(e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="block text-xs text-muted-foreground">
            Minimal belanja
            <input
              value={minSpend}
              inputMode="numeric"
              onChange={(e) => setMinSpend(e.target.value)}
              className={fieldClass}
            />
          </label>
          <button
            disabled={!code || !Number(value)}
            onClick={() => {
              actions.saveVoucher({
                code,
                type,
                value: Number(value),
                minSpend: Number(minSpend) || 0,
                active: true,
              });
              setCode("");
              setValue("");
              setMinSpend("");
            }}
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-40"
          >
            Simpan voucher
          </button>
        </SectionCard>

        <SectionCard title="Voucher aktif">
          {vouchers.length === 0 ? (
            <p className="text-xs text-muted-foreground">Belum ada voucher.</p>
          ) : (
            <ul className="space-y-2">
              {vouchers.map((v) => (
                <li
                  key={v.code}
                  className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 px-3 py-2.5"
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{v.code}</p>
                    <p className="text-xs text-muted-foreground">
                      {v.type === "percent" ? `${v.value}%` : rupiah(v.value)} · min{" "}
                      {rupiah(v.minSpend)}
                    </p>
                  </div>
                  <button
                    onClick={() => actions.saveVoucher({ ...v, active: !v.active })}
                    className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold ${
                      v.active ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
                    }`}
                  >
                    {v.active ? "Aktif" : "Nonaktif"}
                  </button>
                  <button
                    onClick={() => actions.deleteVoucher(v.code)}
                    aria-label={`Hapus ${v.code}`}
                    className="text-muted-foreground"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Banner promo" description="Tampil di beranda pembeli.">
          <label className="block text-xs text-muted-foreground">
            Judul
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="block text-xs text-muted-foreground">
            Subjudul
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="block text-xs text-muted-foreground">
            Badge
            <input
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              className={fieldClass}
            />
          </label>
          <button
            disabled={!title}
            onClick={() => {
              actions.savePromo({ id: uid(), title, subtitle, badge: badge || "Promo" });
              setTitle("");
              setSubtitle("");
              setBadge("");
            }}
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-40"
          >
            Tambah banner
          </button>
        </SectionCard>

        <SectionCard title="Daftar banner">
          {promos.length === 0 ? (
            <p className="text-xs text-muted-foreground">Belum ada banner.</p>
          ) : (
            <ul className="space-y-2">
              {promos.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 px-3 py-2.5"
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.subtitle}</p>
                  </div>
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    {p.badge}
                  </span>
                  <button
                    onClick={() => actions.deletePromo(p.id)}
                    aria-label={`Hapus ${p.title}`}
                    className="text-muted-foreground"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </DashboardShell>
  );
}
