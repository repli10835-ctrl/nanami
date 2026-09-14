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
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[92vh] sm:max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-popover pb-6 shadow-2xl border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            className="h-48 sm:h-56 w-full rounded-t-3xl object-cover"
          />
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 rounded-full bg-background/80 p-2 backdrop-blur hover:bg-background transition"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-4 px-4 sm:px-6 pt-4">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg sm:text-xl font-bold">{item.name}</h2>
              <button
                onClick={share}
                aria-label="Share"
                className="rounded-full bg-secondary p-2 hover:bg-secondary/80 transition"
              >
                <Share2 className="size-4" />
              </button>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{item.description}</p>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3.5" /> Prep {item.prepMinutes} mins + delivery ~20 mins
            </p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {item.badges.map((b) => (
                <span
                  key={b}
                  className="rounded-full border border-border px-2 py-0.5 text-[10px] sm:text-[11px] text-muted-foreground"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>

          {item.groups.map((g) => (
            <div key={g.id}>
              <h3 className="text-xs sm:text-sm font-semibold">
                {g.name}
                <span className="ml-2 text-[11px] font-normal text-muted-foreground">
                  {g.type === "single" ? "Choose one" : "Optional"}
                </span>
              </h3>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {g.choices.map((c) => {
                  const active = (selected[g.id] ?? []).includes(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => toggle(g.id, g.type, c.id)}
                      className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-xs sm:text-sm transition-colors ${
                        active
                          ? "border-primary bg-primary/10 text-foreground font-semibold"
                          : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="truncate mr-2">{c.name}</span>
                      <span className="shrink-0">{c.price ? `+ ${rupiah(c.price)}` : "Free"}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div>
            <h3 className="text-xs sm:text-sm font-semibold">Special request</h3>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. no MSG, less spicy"
              className="mt-1.5 w-full rounded-xl border border-input bg-secondary/40 px-3 py-2 text-xs sm:text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 pt-2">
            <div className="flex items-center gap-2 sm:gap-3 rounded-xl border border-border px-2.5 sm:px-3 py-2 shrink-0">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease"
                className="p-0.5 hover:text-primary transition"
              >
                <Minus className="size-3.5 sm:size-4" />
              </button>
              <span className="w-5 text-center text-xs sm:text-sm font-semibold">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                aria-label="Increase"
                className="p-0.5 hover:text-primary transition"
              >
                <Plus className="size-3.5 sm:size-4" />
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
              className="flex-1 rounded-xl bg-primary py-2.5 sm:py-3 px-3 text-xs sm:text-sm font-bold text-primary-foreground hover:brightness-105 transition truncate"
            >
              Add to cart · {rupiah(unitPrice * qty)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
