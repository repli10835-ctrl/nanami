import { useState } from "react";
import { Trash2, UserPlus } from "lucide-react";
import { actions, uid, useStore, type StaffRole } from "@/lib/store";
import { SectionCard, fieldClass } from "./DashboardShell";

const ROLES: { value: StaffRole; label: string; desc: string }[] = [
  { value: "owner", label: "Owner", desc: "Full access including finance and team management" },
  { value: "admin", label: "Admin", desc: "Kitchen operations, order processing, and inventory" },
  { value: "staff", label: "Staff", desc: "Order assistance and processing only" },
];

const PERMISSIONS: { label: string; owner: boolean; admin: boolean; staff: boolean }[] = [
  { label: "View & process orders", owner: true, admin: true, staff: true },
  { label: "Toggle menu availability", owner: true, admin: true, staff: false },
  { label: "Add / edit / delete menu items", owner: true, admin: false, staff: false },
  { label: "Manage promos & vouchers", owner: true, admin: false, staff: false },
  { label: "View financial reports", owner: true, admin: true, staff: false },
  { label: "Manage team accounts & permissions", owner: true, admin: false, staff: false },
  { label: "Edit restaurant settings", owner: true, admin: false, staff: false },
];

export function StaffPanel() {
  const staff = useStore((s) => s.staff);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<StaffRole>("admin");

  const invite = () => {
    actions.saveStaff({
      id: uid(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role,
      active: true,
      createdAt: Date.now(),
    });
    setName("");
    setEmail("");
    setPhone("");
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[340px_1fr] xl:items-start">
      <SectionCard title="Invite new member" description="Send invite link to team member's email.">
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
        <div className="space-y-2 pt-1">
          {ROLES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRole(r.value)}
              className={`w-full rounded-xl border px-3 py-2.5 text-left ${
                role === r.value ? "border-primary bg-primary/10" : "border-border bg-secondary/40"
              }`}
            >
              <p className="text-sm font-semibold">{r.label}</p>
              <p className="text-[11px] text-muted-foreground">{r.desc}</p>
            </button>
          ))}
        </div>
        <button
          disabled={!name.trim() || !email.trim()}
          onClick={invite}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-40"
        >
          <UserPlus className="size-4" /> Send invitation
        </button>
      </SectionCard>

      <div className="space-y-4">
        <SectionCard title="Accounts & staff" description={`${staff.length} registered members.`}>
          <ul className="space-y-2">
            {staff.map((m) => (
              <li
                key={m.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-secondary/30 px-3 py-2.5"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                  {m.name.slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-40 flex-1">
                  <p className="text-sm font-semibold">{m.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.email}
                    {m.phone ? ` · ${m.phone}` : ""}
                  </p>
                </div>
                <select
                  value={m.role}
                  aria-label={`Role ${m.name}`}
                  onChange={(e) => actions.updateStaff(m.id, { role: e.target.value as StaffRole })}
                  className="rounded-lg border border-input bg-secondary/40 px-2 py-1.5 text-xs"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => actions.updateStaff(m.id, { active: !m.active })}
                  className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold ${
                    m.active ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
                  }`}
                >
                  {m.active ? "Active" : "Inactive"}
                </button>
                <button
                  onClick={() => actions.deleteStaff(m.id)}
                  aria-label={`Delete ${m.name}`}
                  className="text-muted-foreground"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Permission matrix" description="Capabilities granted to each role.">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr>
                  <th className="py-2">Capability</th>
                  <th className="py-2 text-center">Owner</th>
                  <th className="py-2 text-center">Admin</th>
                  <th className="py-2 text-center">Staff</th>
                </tr>
              </thead>
              <tbody>
                {PERMISSIONS.map((p) => (
                  <tr key={p.label} className="border-t border-border">
                    <td className="py-2.5">{p.label}</td>
                    {[p.owner, p.admin, p.staff].map((ok, i) => (
                      <td
                        key={i}
                        className={`py-2.5 text-center ${
                          ok ? "text-success" : "text-muted-foreground"
                        }`}
                      >
                        {ok ? "Yes" : "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
