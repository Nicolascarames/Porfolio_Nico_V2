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
    return <div className="p-6 text-ink-muted">Loading…</div>;
  }

  return (
    <div className="r4-glass flex w-full flex-col gap-3 rounded-r4-xl p-6 sm:p-8">
      <p className="r4-eyebrow">Admin</p>
      <h2 className="r4-title mb-2 text-3xl text-ink">Usuarios</h2>
      {error && <p className="text-sm text-signal-error">{error}</p>}
      <div className="relative w-full max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email"
          aria-label="Search users"
          className="h-10 w-full rounded-r4-md border border-glass-edge bg-glass pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint focus:border-frost-100 focus:outline-none focus:ring-2 focus:ring-focus-ring"
        />
      </div>
      <table className="w-full text-left text-sm text-ink">
        <thead>
          <tr className="text-ink-faint">
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
              <tr key={u.id} className="border-t border-glass-edge">
                <td className="py-2">{displayName}</td>
                <td className="text-ink-muted">{u.email ?? "—"}</td>
                <td>
                  <select
                    value={u.role}
                    disabled={isSelf}
                    aria-label={`Role for ${displayName}`}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="rounded-r4-sm border border-glass-edge bg-glass px-2 py-1 text-ink focus:outline-none focus:ring-2 focus:ring-focus-ring disabled:opacity-50"
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
              <td colSpan={3} className="py-4 text-center text-ink-faint">
                No users match “{search}”.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
