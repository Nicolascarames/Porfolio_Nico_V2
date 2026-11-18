import type MatterNS from 'matter-js';

export type Matter = typeof MatterNS;

let pending: Promise<Matter> | null = null;

/** Carga matter-js con import() la primera vez que se pide (solo cuando la
 * sección entra en pantalla) y reutiliza el módulo después. */
export function loadMatter(): Promise<Matter> {
  pending ??= import('matter-js').then((m) => (m.default ?? m) as Matter);
  return pending;
}

/** Matter.Mouse solo escucha la suelta dentro de su elemento: si sueltas
 * fuera de la caja, la ficha se queda pegada al cursor. Esto reenvía la
 * suelta de cualquier sitio de la ventana. Devuelve la función que lo quita. */
export function releaseAnywhere(mouse: MatterNS.Mouse): () => void {
  const up = (mouse as MatterNS.Mouse & Record<string, EventListener>).mouseup;
  const onUp = (e: Event) => {
    if (e.target instanceof Node && (mouse.element as HTMLElement).contains(e.target)) return; // ya lo trata Matter
    up(e);
  };
  window.addEventListener('mouseup', onUp);
  window.addEventListener('touchend', onUp);
  return () => {
    window.removeEventListener('mouseup', onUp);
    window.removeEventListener('touchend', onUp);
  };
}

/** Quita los listeners que Matter.Mouse pone en su elemento (incluida la
 * rueda: la página debe seguir haciendo scroll sobre la caja). */
export function detachMouse(mouse: MatterNS.Mouse, wheelOnly = false) {
  const m = mouse as MatterNS.Mouse & Record<string, EventListener>;
  const el = mouse.element as HTMLElement;
  for (const ev of ['mousewheel', 'DOMMouseScroll', 'wheel']) el.removeEventListener(ev, m.mousewheel);
  if (wheelOnly) return;
  el.removeEventListener('mousemove', m.mousemove);
  el.removeEventListener('mousedown', m.mousedown);
  el.removeEventListener('mouseup', m.mouseup);
  el.removeEventListener('touchmove', m.mousemove);
  el.removeEventListener('touchstart', m.mousedown);
  el.removeEventListener('touchend', m.mouseup);
}
