import { Link } from "@tanstack/react-router";
import { ChevronRight, ShoppingCart } from "lucide-react";
import { cartTotals, rupiah, useStore } from "@/lib/store";

export function FloatingCart() {
  const cart = useStore((s) => s.cart);
  const { subtotal, items } = cartTotals(cart);
  if (items === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-12 z-40 px-2 sm:px-4">
      <div className="w-full max-w-2xl mx-auto">
        <Link
          to="/cart"
          className="flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-primary-foreground shadow-md shadow-black/30 transition hover:brightness-105 active:scale-[0.99]"
        >
          <ShoppingCart className="size-4" />
          <span className="text-xs font-bold">{items} items</span>
          <span className="ml-auto text-xs font-extrabold">{rupiah(subtotal)}</span>
          <ChevronRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
