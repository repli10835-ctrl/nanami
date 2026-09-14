import { actions, useStore } from "@/lib/store";
import { SectionCard, fieldClass } from "./DashboardShell";

export function SettingsPanel({ scope = "admin" }: { scope?: "admin" | "owner" }) {
  const settings = useStore((s) => s.settings);

  const toggles = [
    { key: "storeOpen" as const, label: "Store open" },
    { key: "deliveryOn" as const, label: "Delivery service" },
    { key: "pickupOn" as const, label: "Pickup service" },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
      <SectionCard title="Store Operations">
        {toggles.map((t) => (
          <button
            key={t.key}
            onClick={() => actions.updateSettings({ [t.key]: !settings[t.key] })}
            className="flex w-full items-center justify-between rounded-xl border border-border bg-secondary/40 px-3 py-2.5 text-sm"
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
          Business hours
          <input
            value={settings.openHours}
            onChange={(e) => actions.updateSettings({ openHours: e.target.value })}
            className={fieldClass}
          />
        </label>
      </SectionCard>

      <SectionCard title="Delivery Rules">
        <label className="block text-xs text-muted-foreground">
          Base delivery fee (R)
          <input
            value={settings.baseFee}
            inputMode="numeric"
            onChange={(e) => actions.updateSettings({ baseFee: Number(e.target.value) || 0 })}
            className={fieldClass}
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          Delivery fee per km (R)
          <input
            value={settings.feePerKm}
            inputMode="numeric"
            onChange={(e) => actions.updateSettings({ feePerKm: Number(e.target.value) || 0 })}
            className={fieldClass}
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          Max delivery radius (km)
          <input
            value={settings.maxRadiusKm}
            inputMode="numeric"
            onChange={(e) => actions.updateSettings({ maxRadiusKm: Number(e.target.value) || 0 })}
            className={fieldClass}
          />
        </label>
      </SectionCard>

      <SectionCard title="Payment & Contact">
        <label className="block text-xs text-muted-foreground">
          WhatsApp Hotline Number
          <input
            value={settings.whatsapp}
            onChange={(e) => actions.updateSettings({ whatsapp: e.target.value })}
            className={fieldClass}
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          Bank Name
          <input
            value={settings.bankName}
            onChange={(e) => actions.updateSettings({ bankName: e.target.value })}
            className={fieldClass}
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          Account Number
          <input
            value={settings.bankAccount}
            onChange={(e) => actions.updateSettings({ bankAccount: e.target.value })}
            className={fieldClass}
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          Account Holder Name
          <input
            value={settings.bankHolder}
            onChange={(e) => actions.updateSettings({ bankHolder: e.target.value })}
            className={fieldClass}
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          E-Wallet / Instant Pay Detail
          <input
            value={settings.ewallet}
            onChange={(e) => actions.updateSettings({ ewallet: e.target.value })}
            className={fieldClass}
          />
        </label>
      </SectionCard>

      {scope === "owner" && (
        <SectionCard title="Loyalty & Security" description="Only configurable by store owner.">
          <label className="block text-xs text-muted-foreground">
            Points earned per R 100 spent
            <input
              value={settings.pointsPer10k}
              inputMode="numeric"
              onChange={(e) =>
                actions.updateSettings({ pointsPer10k: Number(e.target.value) || 0 })
              }
              className={fieldClass}
            />
          </label>
          <label className="block text-xs text-muted-foreground">
            Admin Panel Password
            <input
              value={settings.adminPassword}
              onChange={(e) => actions.updateSettings({ adminPassword: e.target.value })}
              className={fieldClass}
            />
          </label>
        </SectionCard>
      )}
    </div>
  );
}
