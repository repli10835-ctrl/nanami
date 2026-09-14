import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { KitchenBoard } from "@/components/dashboard/KitchenBoard";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Papan Dapur — Panel Admin Nanami Kitchen" },
      {
        name: "description",
        content:
          "Papan operasional dapur Nanami Kitchen: pesanan masuk, sedang diproses, siap, dan selesai dalam satu tampilan.",
      },
      { property: "og:title", content: "Papan Dapur — Panel Admin Nanami Kitchen" },
      {
        property: "og:description",
        content: "Kelola alur pesanan dapur Nanami Kitchen dari masuk sampai selesai.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminHome,
});

function AdminHome() {
  const settings = useStore((s) => s.settings);
  const soldOut = useStore((s) => s.menu.filter((m) => !m.available).length);

  return (
    <DashboardShell
      role="admin"
      title="Papan dapur"
      subtitle={settings.storeOpen ? "Toko sedang buka" : "Toko sedang tutup"}
      actions={
        <div className="flex items-center gap-2">
          {soldOut > 0 && (
            <Link
              to="/admin/stock"
              className="rounded-full bg-destructive/15 px-3 py-1.5 text-xs font-semibold text-destructive"
            >
              {soldOut} menu habis
            </Link>
          )}
          <Link
            to="/admin/orders"
            className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground"
          >
            Pesanan harian
          </Link>
        </div>
      }
    >
      <KitchenBoard />
    </DashboardShell>
  );
}
