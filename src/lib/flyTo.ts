import { prefersReducedMotion } from '../hooks/useReducedMotion';

/**
 * La tarjeta "vuela" hasta la pantalla de la tablet: FLIP con un clon fijo
 * (port de R4.flyTo, Diseño_claude_desing/reality404-v2/shared/bundle.js).
 * Resuelve al terminar; con reduced motion resuelve al instante.
 */
export function flyTo(fromEl: HTMLElement, toEl: HTMLElement): Promise<void> {
  if (prefersReducedMotion() || !fromEl.animate) return Promise.resolve();

  const a = fromEl.getBoundingClientRect();
  const b = toEl.getBoundingClientRect();
  const ghost = fromEl.cloneNode(true) as HTMLElement;
  ghost.removeAttribute('id');
  ghost.setAttribute('aria-hidden', 'true');
  Object.assign(ghost.style, {
    position: 'fixed',
    left: `${a.left}px`,
    top: `${a.top}px`,
    width: `${a.width}px`,
    height: `${a.height}px`,
    margin: '0',
    zIndex: '9999',
    pointerEvents: 'none',
    transform: 'none',
    transformOrigin: '0 0',
    overflow: 'hidden',
  });
  document.body.appendChild(ghost);

  const sx = b.width / a.width;
  const sy = b.height / a.height;
  const dx = b.left - a.left;
  const dy = b.top - a.top;

  const anim = ghost.animate(
    [
      { transform: 'translate(0,0) scale(1,1)', opacity: 1, filter: 'blur(0)' },
      {
        transform: `translate(${dx * 0.55}px,${dy * 0.55 - 40}px) scale(${1 + (sx - 1) * 0.5},${1 + (sy - 1) * 0.5})`,
        opacity: 1,
        offset: 0.6,
      },
      { transform: `translate(${dx}px,${dy}px) scale(${sx},${sy})`, opacity: 0.2, filter: 'blur(2px)' },
    ],
    { duration: 640, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
  );

  return new Promise((resolve) => {
    const done = () => {
      ghost.remove();
      resolve();
    };
    anim.onfinish = done;
    anim.oncancel = done;
  });
}
