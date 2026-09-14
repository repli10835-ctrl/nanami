import { useMemo, useState } from "react";
import { Minus, Plus, Share2, X, Clock } from "lucide-react";
import { actions, rupiah, type MenuItem } from "@/lib/store";

export function ProductSheet({ item, onClose }: { item: MenuItem; onClose: () => void }) {
  const [selected, setSelected] = useState<Record<string, string[]>>(() => {
    const init: Record<string, string[]> = {};
    item.groups.forEach((g) => {
      init[g.id] = g.type === "single" ? [g.choices[0]?.id ?? ""] : [];
    });
    return init;
  });
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");

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

  function share() {
    const url = typeof window !== "undefined" ? window.location.origin + "/menu" : "";
    const text = `Check out ${item.name} at Nanami Kitchen — ${rupiah(item.price)} ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/70" onClick={onClose}>
      <div
        className="shell max-h-[90vh] overflow-y-auto rounded-t-3xl bg-popover pb-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            className="h-48 w-full rounded-t-3xl object-cover"
          />
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 rounded-full bg-background/80 p-2"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-5 px-4 pt-4">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-bold">{item.name}</h2>
              <button onClick={share} aria-label="Share" className="rounded-full bg-secondary p-2">
                <Share2 className="size-4" />
              </button>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3.5" /> Prep {item.prepMinutes} mins + delivery ~20 mins
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {item.badges.map((b) => (
                <span
                  key={b}
                  className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>

          {item.groups.map((g) => (
            <div key={g.id}>
              <h3 className="text-sm font-semibold">
                {g.name}
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  {g.type === "single" ? "Choose one" : "Optional"}
                </span>
              </h3>
              <div className="mt-2 space-y-2">
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
            </div>
          ))}

          <div>
            <h3 className="text-sm font-semibold">Special request</h3>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. no MSG, less spicy"
              className="mt-2 w-full rounded-xl border border-input bg-secondary/40 px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-border px-3 py-2">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">
                <Minus className="size-4" />
              </button>
              <span className="w-5 text-center text-sm font-semibold">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} aria-label="Increase">
                <Plus className="size-4" />
              </button>
            </div>
            <button
              onClick={() => {
                actions.addToCart({
                  itemId: item.id,
                  name: item.name,
                  unitPrice,
                  qty,
                  optionLabels: labels,
                  note,
                });
                onClose();
              }}
              className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground"
            >
              Add to cart · {rupiah(unitPrice * qty)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
