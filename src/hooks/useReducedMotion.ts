import { useMediaQuery } from './useMediaQuery';

/** true si el usuario pide reducir movimiento: mostrar el estado final sin animar. */
export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/** Lectura puntual fuera de React (handlers, utilidades imperativas). */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
