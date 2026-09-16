import { Link } from "@tanstack/react-router";
import { ChevronRight, ShoppingCart } from "lucide-react";
import { cartTotals, rupiah, useStore } from "@/lib/store";

export function FloatingCart() {
  const cart = useStore((s) => s.cart);
  const { subtotal, items } = cartTotals(cart);
  if (items === 0) return null;

  return (
    <div className="fixed bottom-14 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-3 pointer-events-none">
      <div className="w-full pointer-events-auto">
        <Link
          to="/cart"
          className="flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2.5 text-primary-foreground shadow-lg shadow-black/40 transition hover:brightness-105 active:scale-[0.99]"
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
