import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Plus, Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { actions, CATEGORIES, rupiah, useStore, type Category } from "@/lib/store";

type MenuSearch = { category?: Category };

export const Route = createFileRoute("/menu/")({
  validateSearch: (search: Record<string, unknown>): MenuSearch => {
    const raw = search["category"] as Category | undefined;
    return raw && CATEGORIES.includes(raw) ? { category: raw } : {};
  },
  head: () => ({
    meta: [
      { title: "Menu — Nanami Kitchen" },
      {
        name: "description",
        content: "Browse foods, snacks, drinks and combos from Nanami Kitchen and add them in one tap.",
      },
      { property: "og:title", content: "Menu — Nanami Kitchen" },
      { property: "og:description", content: "Foods, snacks, drinks and combos ready to order." },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const { category } = Route.useSearch();
  const menu = useStore((s) => s.menu);
  const [tab, setTab] = useState<Category>(category ?? "Foods");
  const [q, setQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const list = menu.filter(
    (m) =>
      (q ? m.name.toLowerCase().includes(q.toLowerCase()) : m.category === tab) &&
      true,
  );

  return (
    <AppShell>
      <header className="flex items-center gap-3">
        <button
          onClick={() => window.history.back()}
          aria-label="Back"
          className="-ml-1 p-1 text-foreground"
        >
          <ChevronLeft className="size-7" />
        </button>
        <h1 className="text-2xl font-bold">Menu</h1>
        <button
          onClick={() => setSearchOpen((v) => !v)}
          aria-label="Search menu"
          className="ml-auto p-1 text-foreground"
        >
          <Search className="size-6" />
        </button>
      </header>

      {searchOpen && (
        <div className="mt-3 flex items-center gap-2 rounded-full border border-input bg-secondary/40 px-4 py-2.5">
          <Search className="size-4 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search menu..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
      )}

      <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => {
              setTab(c);
              setQ("");
            }}
            className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold ${
              tab === c && !q
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-secondary/40 text-muted-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {list.map((m) => (
          <div
            key={m.id}
            className="glow-card flex items-center gap-3 p-3"
          >
            <Link
              to="/menu/$itemId"
              params={{ itemId: m.id }}
              aria-label={m.name}
              className="shrink-0"
            >
              <img
                src={m.image}
                alt={m.name}
                loading="lazy"
                className="size-24 rounded-xl object-cover"
              />
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                to="/menu/$itemId"
                params={{ itemId: m.id }}
                className="block w-full text-left"
              >
                <p className="line-clamp-2 text-base font-semibold">{m.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{rupiah(m.price)}</p>
                {!m.available && <p className="mt-1 text-[11px] text-destructive">Sold out</p>}
              </Link>
              <div className="mt-2 flex justify-end">
                <button
                  disabled={!m.available}
                  aria-label={`Add ${m.name}`}
                  onClick={() =>
                    actions.addToCart({
                      itemId: m.id,
                      name: m.name,
                      unitPrice: m.price,
                      qty: 1,
                      optionLabels: [],
                      note: "",
                    })
                  }
                  className="rounded-xl bg-primary p-2 text-primary-foreground disabled:opacity-30"
                >
                  <Plus className="size-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">No items found.</p>
        )}
      </div>
    </AppShell>
  );
}
