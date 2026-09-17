import { useMemo, useState } from "react";
import { CheckCheck, Search } from "lucide-react";
import {
  actions,
  rupiah,
  useStore,
  CATEGORIES,
  resolveMenuImage,
  handleImageError,
  type Category,
} from "@/lib/store";
import { StatCard } from "./DashboardShell";

const FILTERS = ["All", ...CATEGORIES] as const;

export function StockPanel() {
  const menu = useStore((s) => s.menu);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof FILTERS)[number]>("All");

  const list = useMemo(
    () =>
      menu.filter(
        (m) =>
          (category === "All" || m.category === (category as Category)) &&
          m.name.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [menu, category, query],
  );

  const soldOut = menu.filter((m) => !m.available).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total Items" value={String(menu.length)} hint="In catalog" />
        <StatCard label="Available" value={String(menu.length - soldOut)} hint="Orderable" />
        <StatCard label="Sold Out" value={String(soldOut)} hint="Hidden from store" />
        <StatCard
          label="Categories"
          value={String(new Set(menu.map((m) => m.category)).size)}
          hint="Menu groups"
        />
      </div>

      <div className="glow-card flex flex-wrap items-center gap-3 p-3">
        <label className="relative min-w-52 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search menu name..."
            aria-label="Search menu name"
            className="w-full rounded-xl border border-input bg-secondary/40 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </label>
        <button
          onClick={() => actions.setAllAvailability(true)}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2.5 text-xs font-bold text-primary-foreground"
        >
          <CheckCheck className="size-4" /> Mark All Available
        </button>
      </div>

      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setCategory(f)}
            className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold ${
              category === f
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-secondary/40 text-muted-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No menu items matched your search.
        </p>
      ) : (
        <div className="grid gap-2 md:grid-cols-2">
          {list.map((m) => (
            <div key={m.id} className="glow-card flex items-center gap-3 p-3">
              {m.image ? (
                <img
                  src={resolveMenuImage(m.image)}
                  alt={m.name}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => handleImageError(e)}
                  className="size-12 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <div className="size-12 shrink-0 rounded-xl bg-secondary" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{m.name}</p>
                <p className="text-xs text-muted-foreground">
                  {m.category} · {rupiah(m.price)} · {m.prepMinutes} mins
                </p>
              </div>
              <div className="flex shrink-0 overflow-hidden rounded-xl border border-border">
                <button
                  onClick={() => actions.setAvailability(m.id, true)}
                  aria-pressed={m.available}
                  className={`px-2.5 py-1.5 text-[11px] font-semibold ${
                    m.available ? "bg-success/20 text-success" : "text-muted-foreground"
                  }`}
                >
                  Available
                </button>
                <button
                  onClick={() => actions.setAvailability(m.id, false)}
                  aria-pressed={!m.available}
                  className={`px-2.5 py-1.5 text-[11px] font-semibold ${
                    !m.available ? "bg-destructive/20 text-destructive" : "text-muted-foreground"
                  }`}
                >
                  Sold Out
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
