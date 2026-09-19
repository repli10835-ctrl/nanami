import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { DashboardShell, SectionCard, fieldClass } from "@/components/dashboard/DashboardShell";
import { actions, rupiah, uid, useStore, type Voucher, type Promo } from "@/lib/store";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { StickySaveBar } from "@/components/StickySaveBar";
import { UnsavedChangesPrompt } from "@/components/UnsavedChangesPrompt";

export const Route = createFileRoute("/owner/vouchers")({
  head: () => ({
    meta: [
      { title: "Vouchers & Promos — Owner Panel Nanami Kitchen" },
      {
        name: "description",
        content: "Create and manage discount vouchers and promotional banners for Nanami Kitchen.",
      },
      { property: "og:title", content: "Vouchers & Promos — Nanami Kitchen" },
      { property: "og:description", content: "Manage discount vouchers and promo banners." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: VouchersPage,
});

interface VouchersPageState {
  vouchers: Voucher[];
  promos: Promo[];
}

function VouchersPage() {
  const globalVouchers = useStore((s) => s.vouchers);
  const globalPromos = useStore((s) => s.promos);
  const settings = useStore((s) => s.settings);

  const [localState, setLocalState] = useState<VouchersPageState>(() => ({
    vouchers: globalVouchers,
    promos: globalPromos,
  }));

  const [saving, setSaving] = useState(false);

  // New voucher form state
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState("");
  const [minSpend, setMinSpend] = useState("");

  // New promo form state
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [badge, setBadge] = useState("");

  useEffect(() => {
    const nextState = {
      vouchers: globalVouchers,
      promos: globalPromos,
    };
    setLocalState(nextState);
    markSaved(nextState);
  }, [globalVouchers, globalPromos, markSaved]);

  const { isDirty, markSaved, resetToSnapshot, blocker } = useUnsavedChanges(localState);

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Sync Vouchers
      // Delete removed
      const deletedVouchers = globalVouchers.filter(
        (gv) => !localState.vouchers.some((lv) => lv.code === gv.code),
      );
      for (const v of deletedVouchers) {
        await actions.deleteVoucher(v.code);
      }
      // Save added/updated
      for (const v of localState.vouchers) {
        const gv = globalVouchers.find((x) => x.code === v.code);
        if (!gv || JSON.stringify(gv) !== JSON.stringify(v)) {
          await actions.saveVoucher(v);
        }
      }

      // 2. Sync Promos
      // Delete removed
      const deletedPromos = globalPromos.filter(
        (gp) => !localState.promos.some((lp) => lp.id === gp.id),
      );
      for (const p of deletedPromos) {
        await actions.deletePromo(p.id);
      }
      // Save added/updated
      for (const p of localState.promos) {
        const gp = globalPromos.find((x) => x.id === p.id);
        if (!gp || JSON.stringify(gp) !== JSON.stringify(p)) {
          await actions.savePromo(p);
        }
      }

      markSaved(localState);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const snapshot = resetToSnapshot();
    setLocalState(snapshot);
  };

  return (
    <DashboardShell role="owner" title="Vouchers & Promos" subtitle="Store discount policies">
      <div className="grid gap-4 lg:grid-cols-2 lg:items-start pb-20">
        <SectionCard title="Create Voucher">
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
              <option value="fixed">Fixed Amount ({settings.currencySymbol || "N$"})</option>
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
              const newVoucher: Voucher = {
                code,
                type,
                value: Number(value),
                minSpend: Number(minSpend) || 0,
                active: true,
              };
              setLocalState((prev) => ({
                ...prev,
                vouchers: [...prev.vouchers.filter((v) => v.code !== code), newVoucher],
              }));
              setCode("");
              setValue("");
              setMinSpend("");
            }}
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-40"
          >
            Add to Pending Vouchers
          </button>
        </SectionCard>

        <SectionCard title="Active Vouchers">
          {localState.vouchers.length === 0 ? (
            <p className="text-xs text-muted-foreground">No vouchers available.</p>
          ) : (
            <ul className="space-y-2">
              {localState.vouchers.map((v) => (
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
                    onClick={() => {
                      setLocalState((prev) => ({
                        ...prev,
                        vouchers: prev.vouchers.map((x) =>
                          x.code === v.code ? { ...x, active: !x.active } : x,
                        ),
                      }));
                    }}
                    className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold ${
                      v.active ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
                    }`}
                  >
                    {v.active ? "Active" : "Inactive"}
                  </button>
                  <button
                    onClick={() => {
                      setLocalState((prev) => ({
                        ...prev,
                        vouchers: prev.vouchers.filter((x) => x.code !== v.code),
                      }));
                    }}
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

        <SectionCard title="Promo Banner" description="Appears on customer home screen.">
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
              const newPromo: Promo = { id: uid(), title, subtitle, badge: badge || "Promo" };
              setLocalState((prev) => ({
                ...prev,
                promos: [...prev.promos, newPromo],
              }));
              setTitle("");
              setSubtitle("");
              setBadge("");
            }}
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-40"
          >
            Add to Pending Banners
          </button>
        </SectionCard>

        <SectionCard title="Banner List">
          {localState.promos.length === 0 ? (
            <p className="text-xs text-muted-foreground">No banners active.</p>
          ) : (
            <ul className="space-y-2">
              {localState.promos.map((p) => (
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
                    onClick={() => {
                      setLocalState((prev) => ({
                        ...prev,
                        promos: prev.promos.filter((x) => x.id !== p.id),
                      }));
                    }}
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

      <StickySaveBar isDirty={isDirty} onSave={handleSave} onReset={handleReset} saving={saving} />
      <UnsavedChangesPrompt blocker={blocker} />
    </DashboardShell>
  );
}
