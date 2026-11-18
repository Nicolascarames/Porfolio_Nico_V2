import { useEffect, useState, type RefObject } from 'react';

/**
 * Ancho del elemento (px enteros), actualizado al redimensionar o girar el
 * móvil con un pequeño retardo para no recalcular en cada frame. 0 hasta la
 * primera medición.
 */
export function useElementWidth(ref: RefObject<HTMLElement | null>, delay = 200): number {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer = 0;
    const read = () => setWidth(Math.round(el.clientWidth));
    read();
    const ro = new ResizeObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(read, delay);
    });
    ro.observe(el);
    return () => {
      window.clearTimeout(timer);
      ro.disconnect();
    };
  }, [ref, delay]);

  return width;
}
