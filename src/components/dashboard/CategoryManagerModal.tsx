import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  FolderPlus,
  Pencil,
  Plus,
  Tag,
  Trash2,
  X,
  AlertTriangle,
  UtensilsCrossed,
} from "lucide-react";
import {
  actions,
  useStore,
  getAvailableCategories,
  DEFAULT_CATEGORIES,
  type MenuItem,
} from "@/lib/store";
import { fieldClass } from "./DashboardShell";

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategorySelected?: (categoryName: string) => void;
}

export function CategoryManagerModal({
  isOpen,
  onClose,
  onCategorySelected,
}: CategoryManagerModalProps) {
  const { cms, menu } = useStore((s) => ({ cms: s.cms, menu: s.menu }));
  const categories = getAvailableCategories(cms, menu);
  const categoryNames = cms?.categoryNames || {};

  const [newCatName, setNewCatName] = useState("");
  const [newCatDisplayName, setNewCatDisplayName] = useState("");
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDisplayName, setEditDisplayName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [fallbackCat, setFallbackCat] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const countItems = (cat: string) =>
    menu.filter((m) => m.category?.toLowerCase() === cat.toLowerCase()).length;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCatName.trim();
    if (!name) {
      setErrorMsg("Category name cannot be empty.");
      return;
    }
    if (categories.some((c) => c.toLowerCase() === name.toLowerCase())) {
      setErrorMsg(`Category "${name}" already exists.`);
      return;
    }
    setErrorMsg(null);
    actions.addCategory(name, newCatDisplayName.trim() || name);
    setNewCatName("");
    setNewCatDisplayName("");
    if (onCategorySelected) {
      onCategorySelected(name);
    }
  };

  const startEdit = (cat: string) => {
    setEditingCat(cat);
    setEditName(cat);
    setEditDisplayName(categoryNames[cat] || cat);
    setErrorMsg(null);
  };

  const saveEdit = (cat: string) => {
    const trimmedNew = editName.trim();
    if (!trimmedNew) {
      setErrorMsg("Category name cannot be empty.");
      return;
    }
    if (
      trimmedNew.toLowerCase() !== cat.toLowerCase() &&
      categories.some((c) => c.toLowerCase() === trimmedNew.toLowerCase())
    ) {
      setErrorMsg(`Category "${trimmedNew}" already exists.`);
      return;
    }
    setErrorMsg(null);
    actions.updateCategory(cat, trimmedNew, editDisplayName.trim() || trimmedNew);
    setEditingCat(null);
    if (onCategorySelected) {
      onCategorySelected(trimmedNew);
    }
  };

  const moveCategory = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;
    const newOrder = [...categories];
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    actions.reorderCategories(newOrder);
  };

  const startDelete = (cat: string) => {
    if (categories.length <= 1) {
      setErrorMsg("You must have at least one category in the catalog.");
      return;
    }
    const otherCats = categories.filter((c) => c.toLowerCase() !== cat.toLowerCase());
    setFallbackCat(otherCats[0] || "Meals");
    setDeleteTarget(cat);
    setErrorMsg(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    actions.deleteCategory(deleteTarget, fallbackCat);
    setDeleteTarget(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Tag className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Manage Menu Categories</h2>
              <p className="text-xs text-muted-foreground">
                Create, edit, reorder, or delete catalog categories
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-xl p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-semibold text-destructive">
              <AlertTriangle className="size-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Add New Category Form */}
          <form
            onSubmit={handleAdd}
            className="rounded-xl border border-border bg-secondary/30 p-3.5 space-y-3"
          >
            <div className="flex items-center gap-2">
              <FolderPlus className="size-4 text-primary" />
              <span className="text-xs font-bold text-foreground">Add New Category</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-medium text-muted-foreground">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Rice Bowls, Desserts"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-muted-foreground">
                  Storefront Display Label
                </label>
                <input
                  type="text"
                  value={newCatDisplayName}
                  onChange={(e) => setNewCatDisplayName(e.target.value)}
                  placeholder="e.g. Delicious Bowls (optional)"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium outline-none focus:border-primary"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={!newCatName.trim()}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-xs font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              <Plus className="size-4" /> Add Category
            </button>
          </form>

          {/* Categories List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Existing Categories ({categories.length})
              </span>
              <span className="text-[11px] text-muted-foreground">Reorder for customer tabs</span>
            </div>

            <div className="space-y-2">
              {categories.map((cat, idx) => {
                const isEditing = editingCat === cat;
                const itemCount = countItems(cat);
                const displayName = categoryNames[cat] || cat;

                if (isEditing) {
                  return (
                    <div
                      key={cat}
                      className="rounded-xl border-2 border-primary/60 bg-card p-3 space-y-2.5 shadow-sm"
                    >
                      <div className="flex items-center justify-between pb-1 border-b border-border/50">
                        <span className="text-xs font-bold text-primary">Edit Category</span>
                        <span className="text-[11px] text-muted-foreground">
                          {itemCount} item(s) in catalog
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-semibold text-muted-foreground">
                            Category Key / ID *
                          </label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="mt-0.5 w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-muted-foreground">
                            Display Label
                          </label>
                          <input
                            type="text"
                            value={editDisplayName}
                            onChange={(e) => setEditDisplayName(e.target.value)}
                            className="mt-0.5 w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingCat(null)}
                          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => saveEdit(cat)}
                          className="flex items-center gap-1 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90"
                        >
                          <Check className="size-3.5" /> Save Changes
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={cat}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card/80 p-2.5 hover:border-border/80 transition"
                  >
                    {/* Position & Name */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-secondary text-[11px] font-bold text-muted-foreground">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-xs font-bold text-foreground">
                            {displayName}
                          </p>
                          {displayName !== cat && (
                            <span className="truncate text-[10px] text-muted-foreground">
                              ({cat})
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {itemCount} {itemCount === 1 ? "item" : "items"} assigned
                        </p>
                      </div>
                    </div>

                    {/* Actions: Reorder, Edit, Delete */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => moveCategory(idx, "up")}
                        disabled={idx === 0}
                        aria-label={`Move ${cat} up`}
                        className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-20"
                      >
                        <ArrowUp className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveCategory(idx, "down")}
                        disabled={idx === categories.length - 1}
                        aria-label={`Move ${cat} down`}
                        className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-20"
                      >
                        <ArrowDown className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(cat)}
                        aria-label={`Edit ${cat}`}
                        className="rounded-lg border border-border/80 p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => startDelete(cat)}
                        aria-label={`Delete ${cat}`}
                        className="rounded-lg border border-border/80 p-1.5 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal Overlay */}
        {deleteTarget && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-xl border border-border bg-card p-4 space-y-3 shadow-xl">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="size-5 shrink-0" />
                <h3 className="text-sm font-bold text-foreground">
                  Delete &quot;{deleteTarget}&quot;?
                </h3>
              </div>

              {countItems(deleteTarget) > 0 ? (
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>
                    There are{" "}
                    <strong className="text-foreground">{countItems(deleteTarget)}</strong> menu
                    items in this category. Reassign them to another category:
                  </p>
                  <select
                    value={fallbackCat}
                    onChange={(e) => setFallbackCat(e.target.value)}
                    className="w-full rounded-lg border border-input bg-secondary/80 text-foreground px-3 py-2 text-xs font-semibold outline-none focus:border-primary [&>option]:bg-zinc-900 [&>option]:text-zinc-100"
                  >
                    {categories
                      .filter((c) => c.toLowerCase() !== deleteTarget.toLowerCase())
                      .map((c) => (
                        <option key={c} value={c} className="bg-zinc-900 text-zinc-100">
                          {categoryNames[c] || c}
                        </option>
                      ))}
                  </select>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  This category has no items and will be permanently removed.
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="rounded-lg bg-destructive px-3.5 py-1.5 text-xs font-bold text-destructive-foreground hover:opacity-90"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-border p-3 sm:px-6 flex items-center justify-between bg-muted/20">
          <span className="text-[11px] text-muted-foreground">
            Changes are saved automatically to the database.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-secondary px-4 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary/80"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
