import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin } from "lucide-react";
import { DashboardShell, SectionCard, fieldClass } from "@/components/dashboard/DashboardShell";

export const Route = createFileRoute("/owner/outlets")({
  head: () => ({
    meta: [
      { title: "Outlet — Panel Owner Nanami Kitchen" },
      {
        name: "description",
        content: "Kelola daftar outlet Nanami Kitchen, jam operasional, dan status buka tutup.",
      },
      { property: "og:title", content: "Outlet — Nanami Kitchen" },
      { property: "og:description", content: "Daftar outlet dan jam operasional Nanami Kitchen." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OutletsPage,
});

type Outlet = { id: string; name: string; address: string; hours: string; open: boolean };

const SEED: Outlet[] = [
  {
    id: "1",
    name: "Nanami Kitchen Pusat",
    address: "Jl. Melati No. 12, Jakarta Selatan",
    hours: "10.00 - 22.00",
    open: true,
  },
  {
    id: "2",
    name: "Nanami Kitchen Cabang BSD",
    address: "Ruko Emerald Blok B7, BSD",
    hours: "11.00 - 21.00",
    open: false,
  },
];

function OutletsPage() {
  const [outlets, setOutlets] = useState<Outlet[]>(SEED);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [hours, setHours] = useState("");

  return (
    <DashboardShell role="owner" title="Outlet" subtitle="Lokasi dan jam operasional">
      <div className="grid gap-4 lg:grid-cols-[320px_1fr] lg:items-start">
        <SectionCard title="Tambah outlet">
          <label className="block text-xs text-muted-foreground">
            Nama outlet
            <input value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} />
          </label>
          <label className="block text-xs text-muted-foreground">
            Alamat
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="block text-xs text-muted-foreground">
            Jam operasional
            <input
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="10.00 - 22.00"
              className={fieldClass}
            />
          </label>
          <button
            disabled={!name || !address}
            onClick={() => {
              setOutlets((o) => [
                ...o,
                {
                  id: String(Date.now()),
                  name,
                  address,
                  hours: hours || "10.00 - 22.00",
                  open: true,
                },
              ]);
              setName("");
              setAddress("");
              setHours("");
            }}
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-40"
          >
            Simpan outlet
          </button>
        </SectionCard>

        <div className="grid gap-3 md:grid-cols-2">
          {outlets.map((o) => (
            <div key={o.id} className="glow-card space-y-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold">{o.name}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3.5" /> {o.address}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setOutlets((list) =>
                      list.map((x) => (x.id === o.id ? { ...x, open: !x.open } : x)),
                    )
                  }
                  className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold ${
                    o.open ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
                  }`}
                >
                  {o.open ? "Buka" : "Tutup"}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Jam: {o.hours}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
