import { createContext, useContext, type ReactNode } from "react";
import type { AuthKitClient } from "../lib/supabaseClient";
import type { AuthKitConfig } from "../types";

interface KitContextValue {
  config: AuthKitConfig;
  client: AuthKitClient;
}

const KitContext = createContext<KitContextValue | null>(null);

interface KitProviderProps extends KitContextValue {
  children: ReactNode;
}

export function KitProvider({ config, client, children }: KitProviderProps) {
  return <KitContext.Provider value={{ config, client }}>{children}</KitContext.Provider>;
}

export function useAuthKitConfig(): KitContextValue {
  const ctx = useContext(KitContext);
  if (!ctx) {
    throw new Error("useAuthKitConfig must be used within a KitProvider");
  }
  return ctx;
}
