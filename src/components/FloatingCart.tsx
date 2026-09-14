import { Link } from "@tanstack/react-router";
import { ChevronRight, ShoppingCart } from "lucide-react";
import { cartTotals, rupiah, useStore } from "@/lib/store";

export function FloatingCart() {
  const cart = useStore((s) => s.cart);
  const { subtotal, items } = cartTotals(cart);
  if (items === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-16 z-40 px-4">
      <div className="shell">
        <Link
          to="/cart"
          className="flex items-center gap-3 rounded-2xl bg-primary px-4 py-3 text-primary-foreground shadow-lg shadow-black/40"
        >
          <ShoppingCart className="size-5" />
          <span className="text-sm font-semibold">{items} items</span>
          <span className="ml-auto text-base font-bold">{rupiah(subtotal)}</span>
          <ChevronRight className="size-5" />
        </Link>
      </div>
    </div>
  );
}
