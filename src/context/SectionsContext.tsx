import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuthKitConfig } from '../auth-kit/context/KitProvider';
import { DEFAULT_SECTIONS, parseSections, type SectionsConfig } from '../config/sections';

export const SECTIONS_CACHE_KEY = 'r4.sections.v1';

const SectionsContext = createContext<SectionsConfig>(DEFAULT_SECTIONS);
const ApplySectionsContext = createContext<(next: SectionsConfig) => void>(() => {});

function writeCache(next: SectionsConfig) {
  try {
    localStorage.setItem(SECTIONS_CACHE_KEY, JSON.stringify(next));
  } catch {
    /* sin almacenamiento: solo dura esta visita */
  }
}

function readCache(): SectionsConfig {
  try {
    const saved = localStorage.getItem(SECTIONS_CACHE_KEY);
    if (saved) return parseSections(JSON.parse(saved));
  } catch {
    /* sin almacenamiento o JSON roto: defaults */
  }
  return DEFAULT_SECTIONS;
}

/**
 * Variantes de sección desde portfolio.site_config (id=1) sobre los defaults de
 * config/sections.ts. Arranca con la caché de localStorage y revalida al montar.
 */
export function SectionsProvider({ children }: { children: ReactNode }) {
  const { client } = useAuthKitConfig();
  const [sections, setSections] = useState<SectionsConfig>(readCache);

  useEffect(() => {
    let cancelled = false;
    client
      .from('site_config')
      .select('data')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.warn('site_config:', error.message);
          return;
        }
        const next = parseSections(data?.data ?? {});
        setSections(next);
        writeCache(next);
      });
    return () => {
      cancelled = true;
    };
  }, [client]);

  const apply = useCallback((next: SectionsConfig) => {
    setSections(next);
    writeCache(next);
  }, []);

  return (
    <ApplySectionsContext.Provider value={apply}>
      <SectionsContext.Provider value={sections}>{children}</SectionsContext.Provider>
    </ApplySectionsContext.Provider>
  );
}

/** Variantes activas; fuera de un SectionsProvider devuelve los defaults. */
export function useSections(): SectionsConfig {
  return useContext(SectionsContext);
}

/** Aplica una config ya guardada (p. ej. tras Guardar en /admin/sections) sin recargar. */
export function useApplySections(): (next: SectionsConfig) => void {
  return useContext(ApplySectionsContext);
}
