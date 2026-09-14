import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ChevronRight, MapPin, Search } from "lucide-react";
import { actions, deliveryFeeFor, rupiah, useStore } from "@/lib/store";
import { haversineKm, parseLatLng } from "@/lib/geo";
import mapImg from "@/assets/checkout-map.jpg";

export const Route = createFileRoute("/address")({
  head: () => ({
    meta: [
      { title: "Delivery Address — Nanami Kitchen" },
      {
        name: "description",
        content: "Set your delivery address, delivery radius and see the estimated delivery fee.",
      },
      { property: "og:title", content: "Delivery Address — Nanami Kitchen" },
      {
        property: "og:description",
        content: "Set your delivery address and delivery radius.",
      },
    ],
  }),
  component: AddressPage,
});

const DEFAULT_ADDRESS = "Jl. Melati No.12, Kec. Sukasari, Jakarta Selatan";

function AddressPage() {
  const navigate = useNavigate();
  const { profile, settings, orderType, distanceKm, customerMapsUrl } = useStore((s) => ({
    profile: s.profile,
    settings: s.settings,
    orderType: s.orderType,
    distanceKm: s.distanceKm,
    customerMapsUrl: s.customerMapsUrl,
  }));

  const [mapsUrl, setMapsUrl] = useState(customerMapsUrl);
  const [mapsError, setMapsError] = useState("");

  function applyMapsPoint() {
    const p = parseLatLng(mapsUrl);
    if (!p) {
      setMapsError("Titik belum terbaca. Tempel tautan Google Maps atau koordinat lokasi Anda.");
      return;
    }
    setMapsError("");
    const km =
      haversineKm({ lat: settings.storeLat, lng: settings.storeLng }, p) *
      (settings.routeFactor || 1);
    actions.setCustomerPoint(mapsUrl.trim(), km);
  }

  const [query, setQuery] = useState("");
  const [address, setAddress] = useState(profile.address || DEFAULT_ADDRESS);
  const radius = distanceKm;
  const setRadius = (km: number) => actions.setDistanceKm(km);
  const [editingAddress, setEditingAddress] = useState(false);
  const [radiusOpen, setRadiusOpen] = useState(false);

  const estimatedFee = deliveryFeeFor(
    settings,
    orderType === "pickup" ? "delivery" : orderType,
    radius,
  );

  function save() {
    actions.saveAddress(address);
    actions.updateProfile({ address });
    navigate({ to: "/checkout" });
  }

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="shell px-4 pt-5">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                window.history.back();
              } else {
                navigate({ to: "/checkout" });
              }
            }}
            aria-label="Back"
            className="text-foreground"
          >
            <ArrowLeft className="size-6" />
          </button>
          <h1 className="text-2xl font-semibold">Delivery Address</h1>
        </div>

        {/* Search bar */}
        <label className="mt-6 flex items-center gap-3 rounded-full border border-input bg-secondary/40 px-4 py-3.5">
          <Search className="size-5 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim()) setAddress(query.trim());
            }}
            placeholder="Search Street, Building, or Landmark..."
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>

        {/* Map */}
        <div className="relative mt-4 overflow-hidden rounded-2xl border border-border">
          <img
            src={mapImg}
            alt="Delivery area map"
            width={1024}
            height={640}
            className="h-64 w-full object-cover"
          />
          {/* Center pin */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <MapPin
              className="size-12 -translate-y-3 fill-primary text-primary drop-shadow-[0_6px_8px_rgba(0,0,0,0.45)]"
              strokeWidth={1.5}
            />
          </div>
        </div>

        {/* Titik Google Maps pelanggan */}
        <section className="mt-4 rounded-2xl border border-border bg-card px-5 py-4">
          <h2 className="text-base font-medium text-card-foreground">Titik Google Maps Anda</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Tempel tautan lokasi Google Maps Anda agar ongkir dihitung otomatis dari dapur kami.
          </p>
          <input
            value={mapsUrl}
            onChange={(e) => setMapsUrl(e.target.value)}
            placeholder="https://maps.google.com/?q=-6.2200,106.8000"
            className="mt-3 w-full rounded-xl border border-input bg-secondary/40 px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
          {mapsError ? <p className="mt-1 text-xs text-destructive">{mapsError}</p> : null}
          <button
            onClick={applyMapsPoint}
            className="mt-3 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
          >
            Hitung jarak & ongkir
          </button>
        </section>

        {/* Details card */}
        <section className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="px-5 py-5">
            {editingAddress ? (
              <div className="space-y-2">
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-input bg-secondary/40 px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
                <button
                  onClick={() => setEditingAddress(false)}
                  className="text-sm font-medium text-primary"
                >
                  Done
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingAddress(true)}
                className="w-full text-left text-base font-medium leading-relaxed text-card-foreground"
              >
                {address}
              </button>
            )}
          </div>

          <div className="border-t border-border" />

          {/* Delivery Radius row */}
          <button
            onClick={() => setRadiusOpen((v) => !v)}
            className="flex w-full items-center justify-between px-5 py-5 text-left"
          >
            <span>
              <span className="block text-base font-medium text-card-foreground">
                Delivery Radius
              </span>
              <span className="mt-1 block text-lg text-card-foreground">{radius} km</span>
            </span>
            <ChevronRight
              className={`size-6 text-muted-foreground transition-transform ${radiusOpen ? "rotate-90" : ""}`}
            />
          </button>
          {radiusOpen && (
            <div className="px-5 pb-5">
              <input
                type="range"
                min={1}
                max={settings.maxRadiusKm}
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                aria-label="Delivery radius in kilometers"
                className="w-full accent-[var(--primary)]"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Max delivery range: {settings.maxRadiusKm} km
              </p>
            </div>
          )}

          <div className="border-t border-border" />

          {/* Estimated Delivery Fee row */}
          <div className="flex w-full items-center justify-between px-5 py-5">
            <span>
              <span className="block text-base font-medium text-card-foreground">
                Estimated Delivery Fee
              </span>
              <span className="mt-1 block text-lg text-card-foreground">
                {rupiah(estimatedFee)}{" "}
                <span className="text-sm text-muted-foreground">
                  ({rupiah(settings.feePerKm)} per km)
                </span>
              </span>
            </span>
            <ChevronRight className="size-6 text-muted-foreground" />
          </div>
        </section>

        {/* Save button */}
        <button
          onClick={save}
          disabled={!address.trim()}
          className="mt-6 w-full rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-[0_8px_24px_-8px_var(--color-primary)] disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
        >
          Save Address
        </button>
      </div>
    </div>
  );
}
