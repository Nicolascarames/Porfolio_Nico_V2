import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { prefersReducedMotion } from './useReducedMotion';

/**
 * Amplía el contenedor del dispositivo (#tablet-frame) desde su sitio hasta
 * ocupar la pantalla, y lo devuelve a su hueco (port de
 * Diseño_claude_desing/reality404-v2/components/DeviceFullscreen/preview.html).
 *
 * Diferencias con la demo, a propósito: el bisel lo dibuja `device-frame`
 * (que no se toca), así que no se anima padding/border-radius; y como en modo
 * inline su alto sale del ancho vía aspect-ratio, el destino es el mayor
 * rectángulo con la proporción `aspect` que cabe en el viewport, centrado.
 * Se anima left/top/width/height con WAAPI: el iframe se redimensiona de
 * verdad, nunca con transform: scale.
 */

const DURATION = 640; // --duration-slow
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'; // --ease-liquid

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

function measure(el: Element): Box {
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
}

/** Caja (viewport) que ocupa el dispositivo ampliado con esa proporción. */
export function fitViewport(aspect: number, fill = false): Box {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  // fill: todo el viewport de borde a borde (marco 'mock', config/sections.ts).
  if (fill) return { left: 0, top: 0, width: vw, height: vh };
  const width = Math.min(vw, vh * aspect);
  const height = width / aspect;
  return { left: (vw - width) / 2, top: (vh - height) / 2, width, height };
}

function toStyle(b: Box) {
  return { left: `${b.left}px`, top: `${b.top}px`, width: `${b.width}px`, height: `${b.height}px` };
}

/**
 * Cómo entra el dispositivo al ampliarse:
 * - sin entry: crece desde su hueco en la página (botón "Pantalla completa").
 * - 'from': sale de la caja `box` (la tarjeta de proyecto pulsada) con escala
 *   uniforme y fundido (elegido 2026-11-18).
 */
export type FullscreenEntry = { kind: 'from'; box: Box };

export interface DeviceFullscreenApi {
  isFull: boolean;
  expand: (entry?: FullscreenEntry) => void;
  collapse: () => void;
  /** Botón "Salir" de la HUD: recibe el foco al terminar de ampliar. */
  exitRef: RefObject<HTMLButtonElement>;
}

export function useDeviceFullscreen(
  deviceRef: RefObject<HTMLElement>,
  slotRef: RefObject<HTMLElement>,
  aspect: number,
  fill = false,
): DeviceFullscreenApi {
  const [isFull, setIsFull] = useState(false);
  const full = useRef(false);
  const busy = useRef(false);
  const prevFocus = useRef<HTMLElement | null>(null);
  const aspectRef = useRef(aspect);
  aspectRef.current = aspect;
  const fillRef = useRef(fill);
  fillRef.current = fill;
  const exitRef = useRef<HTMLButtonElement>(null);

  const lockScroll = (on: boolean) => {
    const html = document.documentElement.style;
    html.overflow = on ? 'hidden' : '';
    html.scrollbarGutter = on ? 'stable' : '';
  };

  const expand = useCallback((entry?: FullscreenEntry) => {
    const dev = deviceRef.current;
    const slot = slotRef.current;
    if (!dev || !slot || full.current || busy.current) return;
    busy.current = true;
    full.current = true;
    setIsFull(true);
    prevFocus.current = document.activeElement as HTMLElement | null;

    const from = measure(dev);
    // Reserva el hueco para que la página no salte mientras está ampliado.
    slot.style.width = `${from.width}px`;
    slot.style.height = `${from.height}px`;
    lockScroll(true);
    const to = fitViewport(aspectRef.current, fillRef.current);
    Object.assign(dev.style, { position: 'fixed', zIndex: '1000', margin: '0' }, toStyle(to));

    const finish = () => {
      busy.current = false;
      exitRef.current?.focus({ preventScroll: true });
    };
    if (prefersReducedMotion()) return finish();
    if (!entry) {
      dev.animate([toStyle(from), toStyle(to)], { duration: DURATION, easing: EASE }).onfinish = finish;
    } else {
      // Escala uniforme (sin deformar) desde el centro de la tarjeta.
      const b = entry.box;
      const s = Math.min(b.width / to.width, b.height / to.height);
      const dx = b.left + b.width / 2 - (to.left + to.width / 2);
      const dy = b.top + b.height / 2 - (to.top + to.height / 2);
      dev.animate(
        [
          { opacity: 0, transform: `translate(${dx}px, ${dy}px) scale(${s})` },
          { opacity: 1, offset: 0.35 },
          { opacity: 1, transform: 'none' },
        ],
        { duration: DURATION, easing: EASE },
      ).onfinish = finish;
    }
  }, [deviceRef, slotRef]);

  const collapse = useCallback(() => {
    const dev = deviceRef.current;
    const slot = slotRef.current;
    if (!dev || !slot || !full.current || busy.current) return;
    busy.current = true;
    setIsFull(false);
    lockScroll(false);

    // Si la página se movió por debajo (p. ej. scrollToId o el puente de
    // rueda del iframe), recoloca el hueco a la vista antes de volver:
    // borde inferior con el del viewport, igual que scrollToId align 'bottom'.
    let slotBox = measure(slot);
    const slotBottom = slotBox.top + slotBox.height;
    if (slotBox.top < 0 || slotBottom > window.innerHeight) {
      window.scrollTo({ top: window.scrollY + slotBottom - window.innerHeight, behavior: 'instant' });
      slotBox = measure(slot);
    }

    const from = measure(dev);
    Object.assign(dev.style, toStyle(slotBox));

    const finish = () => {
      dev.style.cssText = '';
      slot.style.cssText = '';
      full.current = false;
      busy.current = false;
      const prev = prevFocus.current;
      const back =
        prev && prev !== document.body && prev !== exitRef.current && document.contains(prev) ? prev : dev;
      back.focus({ preventScroll: true });
    };
    if (prefersReducedMotion()) return finish();
    dev.animate([toStyle(from), toStyle(slotBox)], { duration: DURATION * 0.85, easing: EASE }).onfinish = finish;
  }, [deviceRef, slotRef]);

  // Esc para salir; reencaje al redimensionar o al cambiar tablet ↔ móvil.
  useEffect(() => {
    if (!isFull) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') collapse();
    };
    const refit = () => {
      const dev = deviceRef.current;
      if (dev && full.current && !busy.current) Object.assign(dev.style, toStyle(fitViewport(aspectRef.current, fillRef.current)));
    };
    refit();
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', refit);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', refit);
    };
  }, [isFull, aspect, collapse, deviceRef]);

  // Si el componente se desmonta ampliado, no dejar la página bloqueada.
  useEffect(() => () => lockScroll(false), []);

  return { isFull, expand, collapse, exitRef };
}
