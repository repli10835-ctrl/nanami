import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, SectionCard } from "@/components/dashboard/DashboardShell";
import { rupiah, useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({
    meta: [
      { title: "Customer Data — Admin Panel Nanami Kitchen" },
      {
        name: "description",
        content: "Nanami Kitchen customer directory with order count and total spend.",
      },
      { property: "og:title", content: "Customer Data — Nanami Kitchen" },
      { property: "og:description", content: "Customers, order count, and total spend." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CustomersPage,
});

function CustomersPage() {
  const orders = useStore((s) => s.orders);
  const accounts = useStore((s) => s.accounts);

  const map = new Map<string, { name: string; phone: string; orders: number; spend: number }>();
  orders.forEach((o) => {
    const key = o.customer.phone || o.customer.name || "guest";
    const prev = map.get(key) ?? {
      name: o.customer.name || "Guest",
      phone: o.customer.phone || "-",
      orders: 0,
      spend: 0,
    };
    map.set(key, { ...prev, orders: prev.orders + 1, spend: prev.spend + o.total });
  });
  const rows = [...map.values()].sort((a, b) => b.spend - a.spend);

  return (
    <DashboardShell
      role="admin"
      title="Customers"
      subtitle={`${accounts.length} registered accounts · ${rows.length} active ordering customers`}
    >
      <SectionCard title="Top customers">
        {rows.length === 0 ? (
          <p className="text-xs text-muted-foreground">No customer records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr>
                  <th className="py-2">Name</th>
                  <th className="py-2">WhatsApp</th>
                  <th className="py-2">Orders</th>
                  <th className="py-2 text-right">Total Spend</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.phone + r.name} className="border-t border-border">
                    <td className="py-2.5 font-medium">{r.name}</td>
                    <td className="py-2.5 text-muted-foreground">{r.phone}</td>
                    <td className="py-2.5 text-muted-foreground">{r.orders}</td>
                    <td className="py-2.5 text-right font-semibold">{rupiah(r.spend)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <div className="mt-4">
        <SectionCard title="Registered accounts">
          {accounts.length === 0 ? (
            <p className="text-xs text-muted-foreground">No registered user accounts.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {accounts.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 px-3 py-2.5"
                >
                  <span>{a.name}</span>
                  <span className="text-xs text-muted-foreground">{a.email}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </DashboardShell>
  );
}
