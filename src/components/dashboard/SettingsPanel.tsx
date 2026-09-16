import { Settings } from "@/lib/store";
import { SectionCard, fieldClass } from "./DashboardShell";

export function SettingsPanel({
  scope = "admin",
  settings,
  onChange,
}: {
  scope?: "admin" | "owner";
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
}) {
  const toggles = [
    { key: "storeOpen" as const, label: "Store open" },
    { key: "deliveryOn" as const, label: "Delivery service" },
    { key: "pickupOn" as const, label: "Pickup service" },
    { key: "codEnabled" as const, label: "Cash on Delivery (COD)" },
    { key: "vatEnabled" as const, label: "VAT / Tax Enabled" },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
      <SectionCard title="Store Operations & Tax">
        {toggles.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange({ [t.key]: !settings[t.key] })}
            className="flex w-full items-center justify-between rounded-xl border border-border bg-secondary/40 px-3 py-2.5 text-sm cursor-pointer"
          >
            {t.label}
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                settings[t.key]
                  ? "bg-success/15 text-success"
                  : "bg-destructive/15 text-destructive"
              }`}
            >
              {settings[t.key] ? "Active" : "Inactive"}
            </span>
          </button>
        ))}
        <label className="block text-xs text-muted-foreground">
          VAT Percentage (%)
          <input
            value={settings.vatPercent ?? 15}
            inputMode="numeric"
            type="number"
            min={0}
            onChange={(e) => onChange({ vatPercent: Number(e.target.value) || 0 })}
            className={fieldClass}
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          Business hours
          <input
            value={settings.openHours}
            type="text"
            onChange={(e) => onChange({ openHours: e.target.value })}
            className={fieldClass}
          />
        </label>
      </SectionCard>

      <SectionCard title="Delivery Rules">
        <label className="block text-xs text-muted-foreground">
          Base delivery fee ({settings.currencySymbol || "N$"})
          <input
            value={settings.baseFee}
            inputMode="numeric"
            type="number"
            min={0}
            onChange={(e) => onChange({ baseFee: Number(e.target.value) || 0 })}
            className={fieldClass}
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          Delivery fee per km ({settings.currencySymbol || "N$"})
          <input
            value={settings.feePerKm}
            inputMode="numeric"
            type="number"
            min={0}
            onChange={(e) => onChange({ feePerKm: Number(e.target.value) || 0 })}
            className={fieldClass}
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          Max delivery radius (km)
          <input
            value={settings.maxRadiusKm}
            inputMode="numeric"
            type="number"
            min={0}
            onChange={(e) => onChange({ maxRadiusKm: Number(e.target.value) || 0 })}
            className={fieldClass}
          />
        </label>
      </SectionCard>

      <SectionCard title="Payment & Contact">
        <label className="block text-xs text-muted-foreground">
          WhatsApp Hotline Number
          <input
            value={settings.whatsapp}
            type="text"
            onChange={(e) => onChange({ whatsapp: e.target.value })}
            className={fieldClass}
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          Bank Name
          <input
            value={settings.bankName}
            type="text"
            onChange={(e) => onChange({ bankName: e.target.value })}
            className={fieldClass}
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          Account Number
          <input
            value={settings.bankAccount}
            type="text"
            onChange={(e) => onChange({ bankAccount: e.target.value })}
            className={fieldClass}
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          Account Holder Name
          <input
            value={settings.bankHolder}
            type="text"
            onChange={(e) => onChange({ bankHolder: e.target.value })}
            className={fieldClass}
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          E-Wallet / Instant Pay Detail
          <input
            value={settings.ewallet}
            type="text"
            onChange={(e) => onChange({ ewallet: e.target.value })}
            className={fieldClass}
          />
        </label>
      </SectionCard>

      {scope === "owner" && (
        <SectionCard title="Loyalty & Security" description="Only configurable by store owner.">
          <label className="block text-xs text-muted-foreground">
            Points earned per {settings.currencySymbol || "N$"} 100 spent
            <input
              value={settings.pointsPer10k}
              inputMode="numeric"
              type="number"
              min={0}
              onChange={(e) => onChange({ pointsPer10k: Number(e.target.value) || 0 })}
              className={fieldClass}
            />
          </label>
          <label className="block text-xs text-muted-foreground">
            Admin Panel Password
            <input
              value={settings.adminPassword}
              type="text"
              onChange={(e) => onChange({ adminPassword: e.target.value })}
              className={fieldClass}
            />
          </label>
        </SectionCard>
      )}
    </div>
  );
}
