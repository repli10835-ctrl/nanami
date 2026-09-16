import { useState } from "react";
import { UserPlus, Pencil, Trash2, Mail, Phone, MapPin, Star } from "lucide-react";
import { actions, uid, useStore, type Account } from "@/lib/store";
import { SectionCard, fieldClass } from "./DashboardShell";

export function CustomerPanel() {
  const accounts = useStore((s) => s.accounts);
  const customers = accounts.filter((a) => !a.role || a.role === "user");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [points, setPoints] = useState(0);

  const save = () => {
    const acc: Account = {
      id: editingId || "cust-" + uid(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      addresses: address.trim() ? [address.trim()] : [],
      points: Number(points) || 0,
      password: "password123", // Default password for new manual entries
      role: "user",
    };

    actions.saveAccount(acc);
    reset();
  };

  const reset = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setPoints(0);
  };

  const edit = (a: Account) => {
    setEditingId(a.id);
    setName(a.name);
    setEmail(a.email);
    setPhone(a.phone);
    setAddress(a.address || "");
    setPoints(a.points || 0);
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[340px_1fr] xl:items-start">
      <SectionCard
        title={editingId ? "Edit Customer" : "Add New Customer"}
        description={
          editingId ? "Modify customer profile details." : "Register a new customer manually."
        }
      >
        <label className="block text-xs text-muted-foreground">
          Full name
          <input value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} />
        </label>
        <label className="block text-xs text-muted-foreground">
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className={fieldClass}
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          Phone number
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
            className={fieldClass}
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          Default Address
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            className={fieldClass}
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          Loyalty Points
          <input
            type="number"
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
            className={fieldClass}
          />
        </label>

        <div className="flex gap-2 pt-1">
          <button
            disabled={!name.trim() || !email.trim()}
            onClick={save}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-40"
          >
            {editingId ? <Pencil className="size-4" /> : <UserPlus className="size-4" />}
            {editingId ? "Update Customer" : "Add Customer"}
          </button>
          {editingId && (
            <button
              onClick={reset}
              className="px-4 rounded-xl border border-border bg-secondary/40 text-sm font-bold"
            >
              Cancel
            </button>
          )}
        </div>
      </SectionCard>

      <div className="space-y-4">
        <SectionCard
          title="Customer List"
          description={`${customers.length} registered customers.`}
        >
          <div className="grid gap-3">
            {customers.map((c) => (
              <div
                key={c.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="size-10 shrink-0 flex items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-foreground truncate">{c.name}</h4>
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Mail className="size-3" /> {c.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Phone className="size-3" /> {c.phone}
                      </div>
                      {c.address && (
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <MapPin className="size-3" /> {c.address}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-0 border-border/50">
                  <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-lg">
                    <Star className="size-3 text-primary fill-primary" />
                    <span className="text-xs font-bold">{c.points || 0} pts</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => edit(c)}
                      className="p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"
                      title="Edit Customer"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete customer ${c.name}? This cannot be undone.`)) {
                          actions.deleteAccount(c.id);
                        }
                      }}
                      className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                      title="Delete Customer"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {customers.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">No customers found.</p>
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
