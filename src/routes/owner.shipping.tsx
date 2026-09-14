import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { DashboardShell, SectionCard } from "@/components/dashboard/DashboardShell";
import { actions, deliveryFeeFor, rupiah, useStore } from "@/lib/store";
import { haversineKm, mapsLink, parseLatLng } from "@/lib/geo";

export const Route = createFileRoute("/owner/shipping")({
  head: () => ({
    meta: [
      { title: "Tarif Ongkir — Panel Owner Nanami Kitchen" },
      {
        name: "description",
        content:
          "Atur titik Google Maps lokasi usaha, tarif per kilometer, biaya dasar, ongkir minimum, dan radius pengantaran Nanami Kitchen.",
      },
      { property: "og:title", content: "Tarif Ongkir — Panel Owner Nanami Kitchen" },
      {
        property: "og:description",
        content:
          "Pengaturan tarif ongkir per kilometer dari titik lokasi usaha ke titik pelanggan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ShippingPage,
});

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-[11px] text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

const inputCls =
  "mt-1 w-full rounded-xl border border-input bg-secondary/40 px-3 py-2.5 text-sm outline-none focus:border-primary";

function ShippingPage() {
  const settings = useStore((s) => s.settings);

  const [mapsUrl, setMapsUrl] = useState(settings.storeMapsUrl);
  const [mapsError, setMapsError] = useState("");
  const [testUrl, setTestUrl] = useState("");
  const [testSubtotal, setTestSubtotal] = useState(75000);

  const storePoint = useMemo(
    () => ({ lat: settings.storeLat, lng: settings.storeLng }),
    [settings.storeLat, settings.storeLng],
  );

  function saveStorePoint() {
    const p = parseLatLng(mapsUrl);
    if (!p) {
      setMapsError(
        "Titik tidak terbaca. Tempel tautan Google Maps yang memuat koordinat, atau tulis langsung seperti -6.261493, 106.781194.",
      );
      return;
    }
    setMapsError("");
    actions.updateSettings({ storeMapsUrl: mapsUrl.trim(), storeLat: p.lat, storeLng: p.lng });
  }

  const test = useMemo(() => {
    const p = parseLatLng(testUrl);
    if (!p) return null;
    const straight = haversineKm(storePoint, p);
    const km = straight * (settings.routeFactor || 1);
    return {
      point: p,
      straight,
      km,
      fee: deliveryFeeFor(settings, "delivery", km, testSubtotal),
      outOfRange: km > settings.maxRadiusKm,
    };
  }, [testUrl, testSubtotal, settings, storePoint]);

  const table = [1, 2, 3, 5, 7, 10].filter((km) => km <= settings.maxRadiusKm + 2);

  return (
    <DashboardShell
      role="owner"
      title="Tarif ongkir"
      subtitle="Hitung ongkir dari titik Google Maps usaha ke titik Google Maps pelanggan"
    >
      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <SectionCard
          title="Titik lokasi usaha"
          description="Jarak pengantaran dihitung mulai dari titik ini."
        >
          <div className="space-y-3">
            <Field
              label="Tautan Google Maps atau koordinat"
              hint="Di Google Maps: klik kanan lokasi usaha → klik koordinat untuk menyalin, lalu tempel di sini."
            >
              <input
                value={mapsUrl}
                onChange={(e) => setMapsUrl(e.target.value)}
                placeholder="https://www.google.com/maps?q=-6.261493,106.781194"
                className={inputCls}
              />
            </Field>
            {mapsError ? <p className="text-xs text-destructive">{mapsError}</p> : null}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={saveStorePoint}
                className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
              >
                Simpan titik
              </button>
              <a
                href={mapsLink(storePoint)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs font-medium"
              >
                <MapPin className="size-3.5" /> Lihat di Google Maps
              </a>
            </div>
            <p className="text-xs text-muted-foreground">
              Titik aktif: {storePoint.lat.toFixed(6)}, {storePoint.lng.toFixed(6)}
            </p>
          </div>
        </SectionCard>

        <SectionCard title="Tarif" description="Ongkir = biaya dasar + (jarak km × tarif per km).">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Biaya dasar (Rp)">
              <input
                type="number"
                min={0}
                value={settings.baseFee}
                onChange={(e) => actions.updateSettings({ baseFee: Number(e.target.value) || 0 })}
                className={inputCls}
              />
            </Field>
            <Field label="Tarif per km (Rp)">
              <input
                type="number"
                min={0}
                value={settings.feePerKm}
                onChange={(e) => actions.updateSettings({ feePerKm: Number(e.target.value) || 0 })}
                className={inputCls}
              />
            </Field>
            <Field label="Ongkir minimum (Rp)">
              <input
                type="number"
                min={0}
                value={settings.minFee}
                onChange={(e) => actions.updateSettings({ minFee: Number(e.target.value) || 0 })}
                className={inputCls}
              />
            </Field>
            <Field label="Gratis ongkir mulai (Rp)" hint="Isi 0 untuk menonaktifkan.">
              <input
                type="number"
                min={0}
                value={settings.freeDeliveryAbove}
                onChange={(e) =>
                  actions.updateSettings({ freeDeliveryAbove: Number(e.target.value) || 0 })
                }
                className={inputCls}
              />
            </Field>
            <Field label="Radius maksimal (km)">
              <input
                type="number"
                min={1}
                value={settings.maxRadiusKm}
                onChange={(e) =>
                  actions.updateSettings({ maxRadiusKm: Math.max(1, Number(e.target.value) || 1) })
                }
                className={inputCls}
              />
            </Field>
            <Field label="Faktor jalan" hint="1.3 = jarak jalan ±30% lebih jauh dari garis lurus.">
              <input
                type="number"
                step="0.1"
                min={1}
                value={settings.routeFactor}
                onChange={(e) =>
                  actions.updateSettings({ routeFactor: Math.max(1, Number(e.target.value) || 1) })
                }
                className={inputCls}
              />
            </Field>
          </div>
        </SectionCard>

        <SectionCard
          title="Uji coba titik pelanggan"
          description="Tempel titik Google Maps pelanggan untuk melihat jarak dan ongkirnya."
        >
          <div className="space-y-3">
            <Field label="Tautan Google Maps / koordinat pelanggan">
              <input
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="-6.2200, 106.8000"
                className={inputCls}
              />
            </Field>
            <Field label="Subtotal pesanan (Rp)">
              <input
                type="number"
                min={0}
                value={testSubtotal}
                onChange={(e) => setTestSubtotal(Number(e.target.value) || 0)}
                className={inputCls}
              />
            </Field>
            {testUrl && !test ? (
              <p className="text-xs text-destructive">Titik pelanggan belum terbaca.</p>
            ) : null}
            {test ? (
              <div className="rounded-xl border border-border bg-secondary/30 px-4 py-3 text-sm">
                <p>
                  Jarak lurus <strong>{test.straight.toFixed(2)} km</strong> → jarak tagihan{" "}
                  <strong>{test.km.toFixed(2)} km</strong>
                </p>
                <p className="mt-1 text-lg font-bold text-primary">{rupiah(test.fee)}</p>
                {test.outOfRange ? (
                  <p className="mt-1 text-xs text-destructive">
                    Di luar radius {settings.maxRadiusKm} km.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </SectionCard>

        <SectionCard title="Contoh tarif" description="Perkiraan ongkir per jarak tagihan.">
          <ul className="divide-y divide-border text-sm">
            {table.map((km) => (
              <li key={km} className="flex items-center justify-between py-2.5">
                <span className={km > settings.maxRadiusKm ? "text-muted-foreground" : ""}>
                  {km} km {km > settings.maxRadiusKm ? "(di luar radius)" : ""}
                </span>
                <span className="font-semibold">
                  {rupiah(deliveryFeeFor(settings, "delivery", km))}
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </DashboardShell>
  );
}
