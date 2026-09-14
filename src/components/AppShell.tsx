import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { FloatingCart } from "./FloatingCart";

export function AppShell({
  children,
  hideCartBar = false,
}: {
  children: ReactNode;
  hideCartBar?: boolean;
}) {
  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="shell px-4 pt-5">{children}</div>
      {!hideCartBar && <FloatingCart />}
      <BottomNav />
    </div>
  );
}
