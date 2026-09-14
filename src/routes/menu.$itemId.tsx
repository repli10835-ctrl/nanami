import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, ChevronLeft, Flame, Heart, Minus, Plus, Star } from "lucide-react";
import { actions, rupiah, useStore, type MenuItem } from "@/lib/store";

export const Route = createFileRoute("/menu/$itemId")({
  loader: () => null,
  head: () => ({
    meta: [
      { title: "Detail Menu — Nanami Kitchen" },
      {
        name: "description",
        content:
          "Customize your dish — size, spice level and extra toppings — then add it to your cart.",
      },
      { property: "og:title", content: "Detail Menu — Nanami Kitchen" },
      { property: "og:description", content: "Customize your dish and add it to your cart." },
    ],
  }),
  component: MenuDetailPage,
});

// Deterministic pseudo-rating per item so it stays stable between visits.
function ratingFor(id: string) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 997;
  const rating = (4.5 + (h % 5) / 10).toFixed(1);
  const reviews = 80 + (h % 120);
  return { rating, reviews };
}

function MenuDetailPage() {
  const { itemId } = Route.useParams();
  const menu = useStore((s) => s.menu);
  const item = menu.find((m) => m.id === itemId) as MenuItem | undefined;
  if (!item) return <MenuDetailNotFound />;
  return <MenuDetailContent item={item} />;
}

function MenuDetailContent({ item }: { item: MenuItem }) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Record<string, string[]>>(() => {
    const init: Record<string, string[]> = {};
    item.groups.forEach((g) => {
      init[g.id] = g.type === "single" ? [g.choices[0]?.id ?? ""] : [];
    });
    return init;
  });
  const [qty, setQty] = useState(1);
  const [liked, setLiked] = useState(false);

  const { unitPrice, labels } = useMemo(() => {
    let price = item.price;
    const lbls: string[] = [];
    item.groups.forEach((g) => {
      (selected[g.id] ?? []).forEach((cid) => {
        const c = g.choices.find((x) => x.id === cid);
        if (c) {
          price += c.price;
          lbls.push(c.name);
        }
      });
    });
    return { unitPrice: price, labels: lbls };
  }, [item, selected]);

  function toggle(groupId: string, type: "single" | "multi", choiceId: string) {
    setSelected((prev) => {
      const current = prev[groupId] ?? [];
      if (type === "single") return { ...prev, [groupId]: [choiceId] };
      return {
        ...prev,
        [groupId]: current.includes(choiceId)
          ? current.filter((c) => c !== choiceId)
          : [...current, choiceId],
      };
    });
  }

  const { rating, reviews } = ratingFor(item.id);
  const isSpice = (name: string) => /spic/i.test(name);
  const isSize = (name: string) => /size/i.test(name);

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-background pb-32">
      {/* Hero */}
      <div className="relative">
        <img src={item.image} alt={item.name} className="h-64 w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background" />
        <button
          onClick={() => navigate({ to: "/menu" })}
          aria-label="Back"
          className="absolute left-4 top-4 rounded-full bg-background/70 p-2 backdrop-blur"
        >
          <ChevronLeft className="size-6" />
        </button>
        <button
          onClick={() => setLiked((v) => !v)}
          aria-label="Favorite"
          className="absolute right-4 top-4 rounded-full bg-background/70 p-2 backdrop-blur"
        >
          <Heart
            className={`size-6 transition-colors ${liked ? "fill-primary text-primary" : ""}`}
          />
        </button>
      </div>

      <div className="space-y-7 px-5 pt-2">
        {/* Title, price, rating */}
        <div>
          <h1 className="text-3xl font-bold">{item.name}</h1>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-2xl font-bold">{rupiah(item.price)}</p>
            <p className="flex items-center gap-1.5 text-sm">
              <Star className="size-5 fill-primary text-primary" />
              <span className="text-lg font-bold">{rating}</span>
              <span className="text-muted-foreground">({reviews} reviews)</span>
            </p>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
          {!item.available && (
            <p className="mt-2 text-sm font-semibold text-destructive">Sold out</p>
          )}
        </div>

        {/* Option groups */}
        {item.groups.map((g) => (
          <div key={g.id}>
            <h2 className="text-lg font-bold">{g.name}</h2>

            {g.type === "single" && (isSize(g.name) || isSpice(g.name)) ? (
              <div className="mt-3 grid grid-cols-2 gap-3">
                {g.choices.map((c) => {
                  const active = (selected[g.id] ?? []).includes(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => toggle(g.id, g.type, c.id)}
                      className={`flex flex-col items-start gap-1 rounded-2xl border-2 p-4 text-left transition-colors ${
                        active ? "border-primary bg-primary/10" : "border-border bg-secondary/40"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {isSpice(g.name) ? (
                          <span className="flex">
                            {Array.from({
                              length: c.id === "mild" ? 1 : c.id === "medium" ? 2 : 3,
                            }).map((_, i) => (
                              <Flame
                                key={i}
                                className={`size-4 ${
                                  c.id === "hot"
                                    ? "fill-destructive text-destructive"
                                    : "fill-primary text-primary"
                                }`}
                              />
                            ))}
                          </span>
                        ) : (
                          <span
                            className={`flex size-5 items-center justify-center rounded-full border-2 ${
                              active ? "border-primary" : "border-muted-foreground/50"
                            }`}
                          >
                            {active && <span className="size-2.5 rounded-full bg-primary" />}
                          </span>
                        )}
                        <span className="font-semibold">{c.name}</span>
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {c.price ? rupiah(item.price + c.price) : rupiah(item.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : g.type === "multi" ? (
              <div className="mt-3 space-y-3">
                {g.choices.map((c) => {
                  const active = (selected[g.id] ?? []).includes(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => toggle(g.id, g.type, c.id)}
                      className="flex w-full items-center gap-3 text-left"
                    >
                      <span
                        className={`flex size-7 items-center justify-center rounded-lg border-2 transition-colors ${
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/50"
                        }`}
                      >
                        {active && <Check className="size-4" />}
                      </span>
                      <span className="flex-1 text-base">{c.name}</span>
                      <span className="text-muted-foreground">+{rupiah(c.price)}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {g.choices.map((c) => {
                  const active = (selected[g.id] ?? []).includes(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => toggle(g.id, g.type, c.id)}
                      className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                        active
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-secondary/40 text-muted-foreground"
                      }`}
                    >
                      <span>{c.name}</span>
                      <span>{c.price ? `+ ${rupiah(c.price)}` : "Free"}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md border-t border-border bg-background/95 px-5 py-4 backdrop-blur">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-secondary/40 px-4 py-3">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
            >
              <Minus className="size-4" />
            </button>
            <span className="w-5 text-center text-lg font-bold">{qty}</span>
            <button onClick={() => setQty((q) => q + 1)} aria-label="Increase quantity">
              <Plus className="size-4" />
            </button>
          </div>
          <button
            disabled={!item.available}
            onClick={() => {
              actions.addToCart({
                itemId: item.id,
                name: item.name,
                unitPrice,
                qty,
                optionLabels: labels,
                note: "",
              });
              navigate({ to: "/cart" });
            }}
            className="flex-1 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground disabled:opacity-30"
          >
            Add to Cart - {rupiah(unitPrice * qty)}
          </button>
        </div>
      </div>
    </div>
  );
}

export function MenuDetailNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
      <p className="text-muted-foreground">Menu item not found.</p>
      <Link
        to="/menu"
        className="rounded-xl bg-primary px-4 py-2 font-semibold text-primary-foreground"
      >
        Back to menu
      </Link>
    </div>
  );
}
