import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { DashboardShell, SectionCard, fieldClass } from "@/components/dashboard/DashboardShell";
import { actions, rupiah, uid, useStore } from "@/lib/store";

export const Route = createFileRoute("/owner/vouchers")({
  head: () => ({
    meta: [
      { title: "Promos & Vouchers — Owner Panel Nanami Kitchen" },
      {
        name: "description",
        content: "Create and manage discount vouchers and promotional banners for Nanami Kitchen.",
      },
      { property: "og:title", content: "Promos & Vouchers — Nanami Kitchen" },
      { property: "og:description", content: "Manage discount vouchers and promo banners." },
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
    <DashboardShell role="owner" title="Promos & Vouchers" subtitle="Store discount policies">
      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <SectionCard title="Create voucher">
          <label className="block text-xs text-muted-foreground">
            Voucher Code
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className={fieldClass}
              placeholder="e.g. NANAMI20"
            />
          </label>
          <label className="block text-xs text-muted-foreground">
            Discount Type
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "percent" | "fixed")}
              className={fieldClass}
            >
              <option value="percent">Percentage (%)</option>
              <option value="fixed">Fixed Amount (R)</option>
            </select>
          </label>
          <label className="block text-xs text-muted-foreground">
            Value
            <input
              value={value}
              inputMode="numeric"
              onChange={(e) => setValue(e.target.value)}
              className={fieldClass}
              placeholder="e.g. 15 or 50"
            />
          </label>
          <label className="block text-xs text-muted-foreground">
            Minimum Spend
            <input
              value={minSpend}
              inputMode="numeric"
              onChange={(e) => setMinSpend(e.target.value)}
              className={fieldClass}
              placeholder="e.g. 150"
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
            Save voucher
          </button>
        </SectionCard>

        <SectionCard title="Active vouchers">
          {vouchers.length === 0 ? (
            <p className="text-xs text-muted-foreground">No vouchers available.</p>
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
                    {v.active ? "Active" : "Inactive"}
                  </button>
                  <button
                    onClick={() => actions.deleteVoucher(v.code)}
                    aria-label={`Delete ${v.code}`}
                    className="text-muted-foreground"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Promo banner" description="Appears on customer home screen.">
          <label className="block text-xs text-muted-foreground">
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="block text-xs text-muted-foreground">
            Subtitle
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="block text-xs text-muted-foreground">
            Badge Tag
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
            Add banner
          </button>
        </SectionCard>

        <SectionCard title="Banner list">
          {promos.length === 0 ? (
            <p className="text-xs text-muted-foreground">No banners active.</p>
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
                    aria-label={`Delete ${p.title}`}
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
