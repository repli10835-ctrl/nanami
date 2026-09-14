import { Link, useLocation } from "@tanstack/react-router";
import { Home, UtensilsCrossed, ShoppingBag, Receipt, User } from "lucide-react";
import { useStore, cartTotals } from "@/lib/store";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/menu", label: "Menu", icon: UtensilsCrossed },
  { to: "/cart", label: "Cart", icon: ShoppingBag },
  { to: "/orders", label: "Orders", icon: Receipt },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const cart = useStore((s) => s.cart);
  const { items: count } = cartTotals(cart);
  const { pathname } = useLocation();

  return (
    <nav
      suppressHydrationWarning
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-popover/95 backdrop-blur-md"
    >
      <div className="w-full max-w-2xl mx-auto grid grid-cols-5">
        {items.map(({ to, label, icon: Icon }) => {
          const isActive = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              suppressHydrationWarning
              className={`relative flex flex-col items-center justify-center gap-0.5 py-1.5 text-[10px] font-semibold transition ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              <span>{label}</span>
              {to === "/cart" && count > 0 && (
                <span className="absolute right-1/2 top-1 translate-x-3 rounded-full bg-primary px-1 text-[9px] font-extrabold text-primary-foreground">
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
