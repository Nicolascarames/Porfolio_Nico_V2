import type { ReactNode } from "react";
import { useAuthKitConfig } from "../context/KitProvider";
import { useProfile } from "../hooks/useProfile";

interface Props {
  minRole: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGate({ minRole, children, fallback = null }: Props) {
  const { config } = useAuthKitConfig();
  const { profile, loading } = useProfile();

  if (loading) return null;
  if (!profile) return <>{fallback}</>;

  const minIndex = config.roles.indexOf(minRole);
  if (minIndex === -1) {
    throw new Error(`RoleGate: "${minRole}" is not one of the configured roles (${config.roles.join(", ")}).`);
  }
  const roleIndex = config.roles.indexOf(profile.role);
  return roleIndex >= minIndex ? <>{children}</> : <>{fallback}</>;
}
