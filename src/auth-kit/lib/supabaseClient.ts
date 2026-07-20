import { createClient } from "@supabase/supabase-js";
import type { AuthKitConfig } from "../types";

export function createAuthKitClient(config: AuthKitConfig["supabase"]) {
  const options = config.schema === "public" ? undefined : { db: { schema: config.schema } };
  return createClient(config.url, config.anonKey, options);
}

// Not `SupabaseClient` (bare) — that type defaults its schema generic to
// "public", which mismatches at compile time whenever `config.schema` is a
// non-literal string (i.e. whenever a project uses a non-"public" schema).
// Deriving the type from the actual function keeps it correct regardless of
// which @supabase/supabase-js minor version a consuming project resolves to.
export type AuthKitClient = ReturnType<typeof createAuthKitClient>;
