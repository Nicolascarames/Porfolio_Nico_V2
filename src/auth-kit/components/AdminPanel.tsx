import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useAuthKitConfig } from "../context/KitProvider";
import { useAuth } from "../hooks/useAuth";

interface AdminUserRow {
  id: string;
  email: string | null;
  username: string | null;
  full_name: string | null;
  role: string;
  created_at: string;
}

// Every auth.users account in the shared Supabase project (Desktop_Nav,
// CriptoFiscal, Game_Nav and Portfolio all share one auth.users), not just
// people who have already opened Portfolio — see `portfolio.admin_list_users()`.
// The role edited here is Portfolio's own `portfolio.profiles.role`; it has no
// bearing on that same account's role in a sibling app.
export function AdminPanel() {
  const { client, config } = useAuthKitConfig();
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data, error: fetchError } = await client.rpc("admin_list_users");
      if (cancelled) return;
      if (fetchError) {
        setError(fetchError.message);
      } else {
        setUsers((data ?? []) as AdminUserRow[]);
        setError(null);
      }
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [client]);

  async function handleRoleChange(userId: string, role: string) {
    const previous = users;
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
    const { error: updateError } = await client.rpc("admin_set_role", { target_id: userId, new_role: role });
    if (updateError) {
      setUsers(previous);
      setError(`Could not change role: ${updateError.message}`);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.username, u.full_name, u.email].some((field) => field?.toLowerCase().includes(q))
    );
  }, [users, search]);

  if (loading) {
    return <div className="p-6 text-white/50">Loading…</div>;
  }

  return (
    <div className="flex w-full flex-col gap-3 rounded-[28px] border border-white/10 bg-surface p-8 shadow-card">
      <h2 className="text-xl font-semibold text-white">Users</h2>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <div className="relative w-full max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email"
          aria-label="Search users"
          className="h-10 w-full rounded-md border border-white/10 bg-brand-gray pl-9 pr-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20"
        />
      </div>
      <table className="w-full text-left text-sm text-white">
        <thead>
          <tr className="text-white/40">
            <th className="pb-2 font-normal">User</th>
            <th className="pb-2 font-normal">Email</th>
            <th className="pb-2 font-normal">Role</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((u) => {
            const isSelf = u.id === user?.id;
            const displayName = u.full_name || u.username || u.id;
            return (
              <tr key={u.id} className="border-t border-white/10">
                <td className="py-2">{displayName}</td>
                <td className="text-white/70">{u.email ?? "—"}</td>
                <td>
                  <select
                    value={u.role}
                    disabled={isSelf}
                    aria-label={`Role for ${displayName}`}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="rounded-md border border-white/10 bg-surface px-2 py-1 disabled:opacity-50"
                  >
                    {config.roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            );
          })}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={3} className="py-4 text-center text-white/40">
                No users match “{search}”.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
