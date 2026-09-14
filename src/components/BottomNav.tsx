import { Link } from "@tanstack/react-router";
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

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-popover/95 backdrop-blur">
      <div className="shell grid grid-cols-5">
        {items.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            activeProps={{ className: "text-primary" }}
            inactiveProps={{ className: "text-muted-foreground" }}
            className="relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium"
          >
            <Icon className="size-5" />
            {label}
            {to === "/cart" && count > 0 && (
              <span className="absolute right-1/2 top-1 translate-x-4 rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}
