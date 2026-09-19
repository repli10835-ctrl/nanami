import { useState, useEffect, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { DashboardShell, SectionCard } from "@/components/dashboard/DashboardShell";
import { actions, deliveryFeeFor, rupiah, useStore, type Settings } from "@/lib/store";
import { haversineKm, mapsLink, parseLatLng } from "@/lib/geo";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { StickySaveBar } from "@/components/StickySaveBar";
import { UnsavedChangesPrompt } from "@/components/UnsavedChangesPrompt";

export const Route = createFileRoute("/owner/shipping")({
  head: () => ({
    meta: [
      { title: "Delivery Rates — Owner Panel Nanami Kitchen" },
      {
        name: "description",
        content:
          "Set Google Maps business location, rate per kilometer, base fee, minimum fee, and delivery radius for Nanami Kitchen.",
      },
      { property: "og:title", content: "Delivery Rates — Owner Panel Nanami Kitchen" },
      {
        property: "og:description",
        content:
          "Configure delivery rates per kilometer from business location to customer address.",
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
  const globalSettings = useStore((s) => s.settings);
  const [localSettings, setLocalSettings] = useState(() => globalSettings);
  const [saving, setSaving] = useState(false);

  const [mapsUrl, setMapsUrl] = useState(() => localSettings.storeMapsUrl);
  const [mapsError, setMapsError] = useState("");
  const [testUrl, setTestUrl] = useState("");
  const [testSubtotal, setTestSubtotal] = useState(150);

  useEffect(() => {
    setLocalSettings(globalSettings);
    setMapsUrl(globalSettings.storeMapsUrl);
    markSaved(globalSettings);
  }, [globalSettings, markSaved]);

  const { isDirty, markSaved, resetToSnapshot, blocker } = useUnsavedChanges(localSettings);

  const handleFieldChange = (patch: Partial<Settings>) => {
    setLocalSettings((prev) => ({ ...prev, ...patch }));
  };

  const storePoint = useMemo(
    () => ({ lat: localSettings.storeLat, lng: localSettings.storeLng }),
    [localSettings.storeLat, localSettings.storeLng],
  );

  function saveStorePoint() {
    const p = parseLatLng(mapsUrl);
    if (!p) {
      setMapsError(
        "Location point not recognized. Paste a Google Maps link containing coordinates, or enter latitude, longitude directly (e.g. -26.145, 28.043).",
      );
      return;
    }
    setMapsError("");
    handleFieldChange({ storeMapsUrl: mapsUrl.trim(), storeLat: p.lat, storeLng: p.lng });
  }

  const test = useMemo(() => {
    const p = parseLatLng(testUrl);
    if (!p) return null;
    const straight = haversineKm(storePoint, p);
    const km = straight * (localSettings.routeFactor || 1);
    return {
      point: p,
      straight,
      km,
      fee: deliveryFeeFor(localSettings, "delivery", km, testSubtotal),
      outOfRange: km > localSettings.maxRadiusKm,
    };
  }, [testUrl, testSubtotal, localSettings, storePoint]);

  const table = [1, 2, 3, 5, 7, 10].filter((km) => km <= localSettings.maxRadiusKm + 2);

  const handleSave = async () => {
    setSaving(true);
    try {
      await actions.updateSettings(localSettings);
      markSaved(localSettings);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const snapshot = resetToSnapshot();
    setLocalSettings(snapshot);
    setMapsUrl(snapshot.storeMapsUrl);
    setMapsError("");
  };

  return (
    <DashboardShell
      role="owner"
      title="Delivery rates"
      subtitle="Calculate delivery fees from Google Maps business location to customer location"
    >
      <div className="grid gap-4 lg:grid-cols-2 lg:items-start pb-20">
        <SectionCard
          title="Business store location"
          description="Delivery distance is calculated starting from this point."
        >
          <div className="space-y-3">
            <Field
              label="Google Maps link or coordinates"
              hint="In Google Maps: right-click store location → click coordinates to copy, then paste here."
            >
              <input
                value={mapsUrl}
                type="text"
                onChange={(e) => setMapsUrl(e.target.value)}
                placeholder="https://www.google.com/maps?q=-26.145,28.043"
                className={inputCls}
              />
            </Field>
            {mapsError ? <p className="text-xs text-destructive">{mapsError}</p> : null}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={saveStorePoint}
                className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground cursor-pointer hover:brightness-105"
              >
                Apply Location Point
              </button>
              <a
                href={mapsLink(storePoint)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs font-medium"
              >
                <MapPin className="size-3.5" /> View on Google Maps
              </a>
            </div>
            <p className="text-xs text-muted-foreground">
              Active point: {storePoint.lat.toFixed(6)}, {storePoint.lng.toFixed(6)}
            </p>
          </div>
        </SectionCard>

        <SectionCard
          title="Rate Structure"
          description="Delivery Fee = Base fee + (distance in km × rate per km)."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={`Base fee (${localSettings.currencySymbol || "N$"})`}>
              <input
                type="number"
                min={0}
                value={localSettings.baseFee}
                onChange={(e) => handleFieldChange({ baseFee: Number(e.target.value) || 0 })}
                className={inputCls}
              />
            </Field>
            <Field label={`Rate per km (${localSettings.currencySymbol || "N$"})`}>
              <input
                type="number"
                min={0}
                value={localSettings.feePerKm}
                onChange={(e) => handleFieldChange({ feePerKm: Number(e.target.value) || 0 })}
                className={inputCls}
              />
            </Field>
            <Field label={`Minimum delivery fee (${localSettings.currencySymbol || "N$"})`}>
              <input
                type="number"
                min={0}
                value={localSettings.minFee}
                onChange={(e) => handleFieldChange({ minFee: Number(e.target.value) || 0 })}
                className={inputCls}
              />
            </Field>
            <Field
              label={`Free delivery threshold (${localSettings.currencySymbol || "N$"})`}
              hint="Set to 0 to disable free delivery."
            >
              <input
                type="number"
                min={0}
                value={localSettings.freeDeliveryAbove}
                onChange={(e) =>
                  handleFieldChange({ freeDeliveryAbove: Number(e.target.value) || 0 })
                }
                className={inputCls}
              />
            </Field>
            <Field label="Maximum radius (km)">
              <input
                type="number"
                min={1}
                value={localSettings.maxRadiusKm}
                onChange={(e) =>
                  handleFieldChange({ maxRadiusKm: Math.max(1, Number(e.target.value) || 1) })
                }
                className={inputCls}
              />
            </Field>
            <Field
              label="Route factor"
              hint="1.3 = driving distance is ±30% longer than straight line."
            >
              <input
                type="number"
                step="0.1"
                min={1}
                value={localSettings.routeFactor}
                onChange={(e) =>
                  handleFieldChange({ routeFactor: Math.max(1, Number(e.target.value) || 1) })
                }
                className={inputCls}
              />
            </Field>
          </div>
        </SectionCard>

        <SectionCard
          title="Test customer location"
          description="Paste a customer Google Maps point to test distance and calculated fee."
        >
          <div className="space-y-3">
            <Field label="Customer Google Maps link / coordinates">
              <input
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="-26.1500, 28.0500"
                className={inputCls}
              />
            </Field>
            <Field label={`Order subtotal (${localSettings.currencySymbol || "N$"})`}>
              <input
                type="number"
                min={0}
                value={testSubtotal}
                onChange={(e) => setTestSubtotal(Number(e.target.value) || 0)}
                className={inputCls}
              />
            </Field>
            {testUrl && !test ? (
              <p className="text-xs text-destructive">Customer point could not be read.</p>
            ) : null}
            {test ? (
              <div className="rounded-xl border border-border bg-secondary/30 px-4 py-3 text-sm">
                <p>
                  Direct distance <strong>{test.straight.toFixed(2)} km</strong> → billed distance{" "}
                  <strong>{test.km.toFixed(2)} km</strong>
                </p>
                <p className="mt-1 text-lg font-bold text-primary">{rupiah(test.fee)}</p>
                {test.outOfRange ? (
                  <p className="mt-1 text-xs text-destructive">
                    Outside maximum delivery radius of {localSettings.maxRadiusKm} km.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </SectionCard>

        <SectionCard title="Sample fee table" description="Estimated delivery fees by distance.">
          <ul className="divide-y divide-border text-sm">
            {table.map((km) => (
              <li key={km} className="flex items-center justify-between py-2.5">
                <span className={km > localSettings.maxRadiusKm ? "text-muted-foreground" : ""}>
                  {km} km {km > localSettings.maxRadiusKm ? "(outside radius)" : ""}
                </span>
                <span className="font-semibold">
                  {rupiah(deliveryFeeFor(localSettings, "delivery", km))}
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <StickySaveBar isDirty={isDirty} onSave={handleSave} onReset={handleReset} saving={saving} />
      <UnsavedChangesPrompt blocker={blocker} />
    </DashboardShell>
  );
}
