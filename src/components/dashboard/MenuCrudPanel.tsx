import { useState } from "react";
import { ImagePlus, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  actions,
  rupiah,
  uid,
  useStore,
  CATEGORIES,
  type Category,
  type MenuItem,
} from "@/lib/store";
import { SectionCard, fieldClass } from "./DashboardShell";
import food1 from "@/assets/food-1.jpg";
import food2 from "@/assets/food-2.jpg";
import food3 from "@/assets/food-3.jpg";
import food4 from "@/assets/food-4.jpg";
import hero from "@/assets/hero.jpg";

const GALLERY = [food1, food2, food3, food4, hero];

type Draft = {
  id: string;
  name: string;
  description: string;
  price: string;
  category: Category;
  image: string;
  prepMinutes: string;
  badges: string;
  available: boolean;
};

const emptyDraft = (): Draft => ({
  id: "",
  name: "",
  description: "",
  price: "",
  category: "Foods",
  image: GALLERY[0] ?? "",
  prepMinutes: "15",
  badges: "",
  available: true,
});

const toDraft = (m: MenuItem): Draft => ({
  id: m.id,
  name: m.name,
  description: m.description,
  price: String(m.price),
  category: m.category,
  image: m.image,
  prepMinutes: String(m.prepMinutes),
  badges: m.badges.join(", "),
  available: m.available,
});

export function MenuCrudPanel() {
  const menu = useStore((s) => s.menu);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [filter, setFilter] = useState<"Semua" | Category>("Semua");

  const editing = Boolean(draft.id);
  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }));
  const list = filter === "Semua" ? menu : menu.filter((m) => m.category === filter);
  const valid = draft.name.trim().length > 0 && Number(draft.price) > 0;

  const save = () => {
    const existing = menu.find((m) => m.id === draft.id);
    actions.saveMenuItem({
      id: draft.id || uid(),
      name: draft.name.trim(),
      description: draft.description.trim(),
      price: Number(draft.price),
      category: draft.category,
      image: draft.image,
      available: draft.available,
      prepMinutes: Number(draft.prepMinutes) || 10,
      badges: draft.badges
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean),
      groups: existing?.groups ?? [],
    });
    setDraft(emptyDraft());
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[360px_1fr] xl:items-start">
      <div className="space-y-4">
        <SectionCard
          title={editing ? "Ubah item menu" : "Tambah item menu"}
          description={
            editing
              ? "Perubahan langsung tampil di halaman pembeli."
              : "Isi detail item, lalu simpan ke katalog."
          }
        >
          <label className="block text-xs text-muted-foreground">
            Nama item
            <input
              value={draft.name}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder="Bento Ayam Teriyaki"
              className={fieldClass}
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs text-muted-foreground">
              Harga (Rp)
              <input
                value={draft.price}
                onChange={(e) => patch({ price: e.target.value.replace(/\D/g, "") })}
                inputMode="numeric"
                placeholder="42000"
                className={fieldClass}
              />
            </label>
            <label className="block text-xs text-muted-foreground">
              Waktu masak (menit)
              <input
                value={draft.prepMinutes}
                onChange={(e) => patch({ prepMinutes: e.target.value.replace(/\D/g, "") })}
                inputMode="numeric"
                className={fieldClass}
              />
            </label>
          </div>

          <label className="block text-xs text-muted-foreground">
            Kategori
            <select
              value={draft.category}
              onChange={(e) => patch({ category: e.target.value as Category })}
              className={fieldClass}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs text-muted-foreground">
            Deskripsi
            <textarea
              value={draft.description}
              onChange={(e) => patch({ description: e.target.value })}
              rows={3}
              placeholder="Ayam teriyaki panggang dengan nasi hangat."
              className={fieldClass}
            />
          </label>

          <label className="block text-xs text-muted-foreground">
            Label (pisahkan dengan koma)
            <input
              value={draft.badges}
              onChange={(e) => patch({ badges: e.target.value })}
              placeholder="Halal-friendly, Spicy"
              className={fieldClass}
            />
          </label>

          <div className="text-xs text-muted-foreground">
            Gambar
            <div className="mt-1.5 flex flex-wrap gap-2">
              {GALLERY.map((src) => (
                <button
                  key={src}
                  onClick={() => patch({ image: src })}
                  aria-label="Pilih gambar"
                  aria-pressed={draft.image === src}
                  className={`size-14 overflow-hidden rounded-xl border-2 ${
                    draft.image === src ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img src={src} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
            <label className="mt-2 flex items-center gap-2">
              <ImagePlus className="size-4" />
              <input
                value={draft.image}
                onChange={(e) => patch({ image: e.target.value })}
                placeholder="Tempel alamat gambar (https://...)"
                className="mt-0 w-full rounded-xl border border-input bg-secondary/40 px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </label>
          </div>

          <button
            onClick={() => patch({ available: !draft.available })}
            className="flex w-full items-center justify-between rounded-xl border border-border bg-secondary/40 px-3 py-2.5 text-sm"
          >
            Status ketersediaan
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                draft.available ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
              }`}
            >
              {draft.available ? "Tersedia" : "Habis"}
            </span>
          </button>

          <div className="flex gap-2">
            <button
              disabled={!valid}
              onClick={save}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-40"
            >
              <Plus className="size-4" /> {editing ? "Simpan perubahan" : "Tambah ke katalog"}
            </button>
            {editing && (
              <button
                onClick={() => setDraft(emptyDraft())}
                className="rounded-xl border border-border px-3 py-2.5 text-sm font-semibold text-muted-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Pratinjau kartu pembeli" description="Tampilan item di halaman menu.">
          <div className="w-44 overflow-hidden rounded-2xl border border-border bg-card">
            {draft.image ? (
              <img src={draft.image} alt="" className="h-28 w-full object-cover" />
            ) : (
              <div className="h-28 w-full bg-secondary" />
            )}
            <div className="space-y-1 p-3">
              <p className="text-sm font-semibold">{draft.name || "Nama item"}</p>
              <p className="text-xs text-muted-foreground">
                {draft.price ? rupiah(Number(draft.price)) : "Rp 0"}
              </p>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="space-y-3">
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
          {(["Semua", ...CATEGORIES] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-secondary/40 text-muted-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid gap-2 lg:grid-cols-2">
          {list.map((m) => (
            <div key={m.id} className="glow-card flex items-center gap-3 p-3">
              {m.image ? (
                <img
                  src={m.image}
                  alt={m.name}
                  loading="lazy"
                  className="size-14 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <div className="size-14 shrink-0 rounded-xl bg-secondary" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{m.name}</p>
                <p className="text-xs text-muted-foreground">
                  {m.category} · {rupiah(m.price)}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">{m.description}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  m.available ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
                }`}
              >
                {m.available ? "Tersedia" : "Habis"}
              </span>
              <button
                onClick={() => setDraft(toDraft(m))}
                aria-label={`Ubah ${m.name}`}
                className="shrink-0 rounded-lg border border-border p-1.5 text-muted-foreground"
              >
                <Pencil className="size-4" />
              </button>
              <button
                onClick={() => actions.deleteMenuItem(m.id)}
                aria-label={`Hapus ${m.name}`}
                className="shrink-0 rounded-lg border border-border p-1.5 text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
