import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useAuthKitConfig } from "../context/KitProvider";
import { useProfile } from "../hooks/useProfile";

interface Props {
  children: ReactNode;
}

// Tab bar shown once logged in, above /profile and /admin, so switching
// between them doesn't require retyping the URL. The "Privado" nav button was
// removed on purpose (2026-08-10) — those routes are reached by URL only.
export function PrivateLayout({ children }: Props) {
  const { config } = useAuthKitConfig();
  const { profile } = useProfile();
  const isAdmin = !!profile && config.roles.indexOf(profile.role) >= config.roles.indexOf("admin");

  const tabClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-[9px] px-4 py-2 text-sm font-medium transition-colors ${
      isActive ? "bg-white text-black" : "text-white/55 hover:text-white"
    }`;

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:px-8">
        <nav className="flex gap-1 self-start rounded-xl bg-surface p-1">
          <NavLink to="/profile" className={tabClass} end>
            Perfil
          </NavLink>
          {isAdmin && (
            <>
              <NavLink to="/admin" className={tabClass} end>
                Admin
              </NavLink>
              <NavLink to="/admin/panel" className={tabClass} end>
                Panel
              </NavLink>
            </>
          )}
        </nav>
        {children}
      </div>
    </div>
  );
}
