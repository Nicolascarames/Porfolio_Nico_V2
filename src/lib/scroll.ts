export const NAV_OFFSET_PX = 72;

interface ScrollToIdOptions {
  /** Distancia al borde superior del viewport que se deja libre (para no
   * esconder el elemento bajo el nav sticky). Ignorado si align es 'bottom'. */
  offsetPx?: number;
  /** 'top' alinea el borde superior del elemento con el viewport (menos
   * offsetPx). 'bottom' alinea su borde inferior con el borde inferior del
   * viewport, útil cuando el elemento puede ocupar hasta 100vh y no puede
   * permitirse perder espacio arriba. */
  align?: 'top' | 'bottom';
}

export function scrollToId(id: string, options: ScrollToIdOptions = {}) {
  const el = document.getElementById(id);
  if (!el) return;
  const { offsetPx = NAV_OFFSET_PX, align = 'top' } = options;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rect = el.getBoundingClientRect();
  const top =
    align === 'bottom'
      ? window.scrollY + rect.bottom - window.innerHeight
      : window.scrollY + rect.top - offsetPx;
  window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
}
