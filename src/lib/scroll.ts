export const NAV_OFFSET_PX = 72;

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const top = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET_PX;
  window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
}
