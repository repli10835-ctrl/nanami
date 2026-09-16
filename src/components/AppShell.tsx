import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { FloatingCart } from "./FloatingCart";

export function AppShell({
  children,
  hideCartBar = false,
  hideBottomNav = false,
}: {
  children: ReactNode;
  hideCartBar?: boolean;
  hideBottomNav?: boolean;
}) {
  return (
    <div className="min-h-screen bg-neutral-950 text-foreground flex justify-center selection:bg-primary selection:text-primary-foreground">
      <div
        className={`w-full max-w-md min-h-screen bg-background relative sm:shadow-2xl sm:border-x sm:border-border/40 flex flex-col ${
          hideBottomNav ? "pb-6" : "pb-20"
        }`}
      >
        <div className="w-full px-3 pt-3 flex-1 flex flex-col">{children}</div>
        {!hideCartBar && <FloatingCart />}
        {!hideBottomNav && <BottomNav />}
      </div>
    </div>
  );
}
