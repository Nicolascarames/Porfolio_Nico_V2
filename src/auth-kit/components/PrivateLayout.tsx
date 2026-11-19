import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useAuthKitConfig } from "../context/KitProvider";
import { useProfile } from "../hooks/useProfile";

interface Props {
  children: ReactNode;
  /** Wider page (the server panel): 100% on small screens, 50% of the
   * screen on large ones, never narrower than the default 48rem. */
  wide?: boolean;
}

// Tab bar shown once logged in, above /profile and /admin, so switching
// between them doesn't require retyping the URL. The "Privado" nav button was
// removed on purpose (2026-08-10) — those routes are reached by URL only.
export function PrivateLayout({ children, wide = false }: Props) {
  const { config } = useAuthKitConfig();
  const { profile } = useProfile();
  const isAdmin = !!profile && config.roles.indexOf(profile.role) >= config.roles.indexOf("admin");

  const tabClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-pill px-4 py-2 text-[13px] font-semibold transition-colors ${
      isActive ? "bg-frost-100 text-on-frost" : "text-ink-muted hover:text-ink"
    }`;

  return (
    <div className="relative min-h-screen bg-void">
      <div className="r4-stage-bg" aria-hidden="true" />
      <div className={`relative z-10 mx-auto flex w-full ${wide ? "max-w-[max(48rem,50vw)]" : "max-w-3xl"} flex-col gap-6 px-4 py-10 sm:px-8`}>
        <nav className="r4-glass flex flex-wrap gap-1 self-start rounded-pill p-1">
          <NavLink to="/profile" className={tabClass} end>
            Perfil
          </NavLink>
          {isAdmin && (
            <>
              <NavLink to="/admin" className={tabClass} end>
                Admin
              </NavLink>
              <NavLink to="/admin/sections" className={tabClass} end>
                Secciones
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
