import { useState } from "react";
import { Power, Trash2 } from "lucide-react";
import { actions, rupiah, uid, useStore, CATEGORIES, type Category } from "@/lib/store";
import { SectionCard, fieldClass } from "./DashboardShell";

export function MenuPanel({ canDelete = true }: { canDelete?: boolean }) {
  const menu = useStore((s) => s.menu);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("Foods");

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr] lg:items-start">
      <SectionCard
        title="Add Item"
        description="New menu items appear immediately in the customer store."
      >
        <label className="block text-xs text-muted-foreground">
          Item Name
          <input value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} />
        </label>
        <label className="block text-xs text-muted-foreground">
          Price
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            inputMode="numeric"
            placeholder="35000"
            className={fieldClass}
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          Description
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          Category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className={fieldClass}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <button
          disabled={!name || !Number(price)}
          onClick={() => {
            actions.saveMenuItem({
              id: uid(),
              name,
              description,
              price: Number(price),
              category,
              image: menu[0]?.image ?? "",
              available: true,
              prepMinutes: 15,
              badges: [],
              groups: [],
            });
            setName("");
            setPrice("");
            setDescription("");
          }}
          className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-40"
        >
          Save Item
        </button>
      </SectionCard>

      <div className="space-y-2">
        {menu.map((m) => (
          <div key={m.id} className="glow-card flex items-center gap-3 p-3">
            <div className="flex-1">
              <p className="text-sm font-semibold">{m.name}</p>
              <p className="text-xs text-muted-foreground">
                {m.category} · {rupiah(m.price)}
              </p>
            </div>
            <button
              onClick={() => actions.toggleAvailability(m.id)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold ${
                m.available ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
              }`}
            >
              <Power className="size-3.5" /> {m.available ? "Available" : "Sold Out"}
            </button>
            {canDelete && (
              <button
                onClick={() => actions.deleteMenuItem(m.id)}
                aria-label={`Delete ${m.name}`}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
