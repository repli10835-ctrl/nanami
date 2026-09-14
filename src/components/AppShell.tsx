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
    <div className={`min-h-screen bg-background ${hideBottomNav ? "pb-6" : "pb-20"}`}>
      <div className="w-full px-2.5 pt-2.5 sm:px-4 sm:pt-3 max-w-full sm:max-w-2xl mx-auto">
        {children}
      </div>
      {!hideCartBar && <FloatingCart />}
      {!hideBottomNav && <BottomNav />}
    </div>
  );
}
