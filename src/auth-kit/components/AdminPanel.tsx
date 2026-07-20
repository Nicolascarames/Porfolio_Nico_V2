import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useAuthKitConfig } from "../context/KitProvider";
import { useAuth } from "../hooks/useAuth";
import type { Profile } from "../hooks/useProfile";

export function AdminPanel() {
  const { client, config } = useAuthKitConfig();
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data, error: fetchError } = await client
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: true });
      if (cancelled) return;
      if (fetchError) {
        setError(fetchError.message);
      } else {
        setProfiles((data ?? []) as Profile[]);
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
    const previous = profiles;
    setProfiles((prev) => prev.map((p) => (p.id === userId ? { ...p, role } : p)));
    const { error: updateError } = await client.from("profiles").update({ role }).eq("id", userId);
    if (updateError) {
      setProfiles(previous);
      setError(`Could not change role: ${updateError.message}`);
    }
  }

  // Removes only the profiles row — the anon-key client cannot delete auth.users
  // (that needs the Supabase Admin API / service_role, out of scope for this kit).
  // The account can still authenticate afterward but has no profile row.
  async function handleDelete(userId: string) {
    const { error: deleteError } = await client.from("profiles").delete().eq("id", userId);
    if (deleteError) {
      setError(`Could not delete user: ${deleteError.message}`);
      return;
    }
    setProfiles((prev) => prev.filter((p) => p.id !== userId));
  }

  if (loading) {
    return <div className="p-6 text-white/50">Loading…</div>;
  }

  return (
    <div className="flex flex-col gap-3 p-6">
      <h2 className="text-xl font-semibold text-white">Users</h2>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <table className="w-full text-left text-sm text-white">
        <thead>
          <tr className="text-white/40">
            <th className="pb-2 font-normal">User</th>
            <th className="pb-2 font-normal">Role</th>
            <th className="pb-2 font-normal" />
          </tr>
        </thead>
        <tbody>
          {profiles.map((p) => {
            const isSelf = p.id === user?.id;
            return (
              <tr key={p.id} className="border-t border-white/10">
                <td className="py-2">{p.username ?? p.id}</td>
                <td>
                  <select
                    value={p.role}
                    disabled={isSelf}
                    aria-label={`Role for ${p.username ?? p.id}`}
                    onChange={(e) => handleRoleChange(p.id, e.target.value)}
                    className="rounded-md border border-white/10 bg-surface px-2 py-1 disabled:opacity-50"
                  >
                    {config.roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="text-right">
                  <button
                    type="button"
                    disabled={isSelf}
                    aria-label={`Delete ${p.username ?? p.id}`}
                    onClick={() => handleDelete(p.id)}
                    className="text-red-300 disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
