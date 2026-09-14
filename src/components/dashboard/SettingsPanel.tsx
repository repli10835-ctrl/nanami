import { actions, useStore } from "@/lib/store";
import { SectionCard, fieldClass } from "./DashboardShell";

export function SettingsPanel({ scope = "admin" }: { scope?: "admin" | "owner" }) {
  const settings = useStore((s) => s.settings);

  const toggles = [
    { key: "storeOpen" as const, label: "Toko buka" },
    { key: "deliveryOn" as const, label: "Layanan delivery" },
    { key: "pickupOn" as const, label: "Layanan pickup" },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
      <SectionCard title="Operasional">
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
              {settings[t.key] ? "Aktif" : "Nonaktif"}
            </span>
          </button>
        ))}
        <label className="block text-xs text-muted-foreground">
          Jam buka
          <input
            value={settings.openHours}
            onChange={(e) => actions.updateSettings({ openHours: e.target.value })}
            className={fieldClass}
          />
        </label>
      </SectionCard>

      <SectionCard title="Aturan pengiriman">
        <label className="block text-xs text-muted-foreground">
          Ongkir dasar
          <input
            value={settings.baseFee}
            inputMode="numeric"
            onChange={(e) => actions.updateSettings({ baseFee: Number(e.target.value) || 0 })}
            className={fieldClass}
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          Ongkir per km
          <input
            value={settings.feePerKm}
            inputMode="numeric"
            onChange={(e) => actions.updateSettings({ feePerKm: Number(e.target.value) || 0 })}
            className={fieldClass}
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          Radius maksimal (km)
          <input
            value={settings.maxRadiusKm}
            inputMode="numeric"
            onChange={(e) => actions.updateSettings({ maxRadiusKm: Number(e.target.value) || 0 })}
            className={fieldClass}
          />
        </label>
      </SectionCard>

      <SectionCard title="Pembayaran & kontak">
        <label className="block text-xs text-muted-foreground">
          Nomor WhatsApp
          <input
            value={settings.whatsapp}
            onChange={(e) => actions.updateSettings({ whatsapp: e.target.value })}
            className={fieldClass}
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          Nama bank
          <input
            value={settings.bankName}
            onChange={(e) => actions.updateSettings({ bankName: e.target.value })}
            className={fieldClass}
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          Nomor rekening
          <input
            value={settings.bankAccount}
            onChange={(e) => actions.updateSettings({ bankAccount: e.target.value })}
            className={fieldClass}
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          Atas nama
          <input
            value={settings.bankHolder}
            onChange={(e) => actions.updateSettings({ bankHolder: e.target.value })}
            className={fieldClass}
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          E-wallet
          <input
            value={settings.ewallet}
            onChange={(e) => actions.updateSettings({ ewallet: e.target.value })}
            className={fieldClass}
          />
        </label>
      </SectionCard>

      {scope === "owner" && (
        <SectionCard title="Loyalti & keamanan" description="Hanya dapat diubah oleh owner.">
          <label className="block text-xs text-muted-foreground">
            Poin per Rp10.000
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
            Password panel admin
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
