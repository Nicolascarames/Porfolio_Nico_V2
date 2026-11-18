import { useState } from 'react';

/**
 * Elección del visitante recordada en localStorage. Si el almacenamiento falla
 * (modo privado, bloqueado) o guarda un valor que ya no existe, usa el defecto.
 */
export function useStoredChoice<T extends string>(
  key: string,
  allowed: readonly T[],
  fallback: T,
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved && (allowed as readonly string[]).includes(saved)) return saved as T;
    } catch {
      /* sin almacenamiento: defecto */
    }
    return fallback;
  });

  const choose = (next: T) => {
    setValue(next);
    try {
      localStorage.setItem(key, next);
    } catch {
      /* sin almacenamiento: solo dura esta visita */
    }
  };

  return [value, choose];
}
