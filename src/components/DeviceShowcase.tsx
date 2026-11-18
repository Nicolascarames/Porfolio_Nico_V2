import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { DeviceFrame } from 'device-frame/react';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { fitViewport, useDeviceFullscreen } from '../hooks/useDeviceFullscreen';
import type { FlyBox } from '../lib/flyTo';
import { HelpModal } from './HelpModal';

// /portfolio (no la raíz) es el punto de entrada público de Desktop_Nav: activa
// guestMode y no exige login. También lee ?open=<id> para abrir ese proyecto
// directamente en la ventana "Navegador" (ver PortfolioEntry.tsx en ese repo).
const BASE_URL = 'https://desktop-nav.vercel.app/portfolio';

// Proporciones exactas de Iphone_Clone/src/geometry.ts (ancho / alto).
const TABLET_ASPECT = 1195 / 960;
const PHONE_ASPECT = 2500 / 4722;

interface DeviceShowcaseProps {
  openProjectId?: string | null;
  /** Título que muestra la barra de pantalla completa. */
  title?: string;
}

export interface DeviceShowcaseHandle {
  expand: () => void;
  collapse: () => void;
  /** Caja de viewport que ocupará el dispositivo ampliado (destino del vuelo). */
  fullscreenBox: () => FlyBox;
}

export const DeviceShowcase = forwardRef<DeviceShowcaseHandle, DeviceShowcaseProps>(function DeviceShowcase(
  { openProjectId, title = 'reality404' },
  ref,
) {
  const isMobile = useMediaQuery('(max-width: 820px)');
  const [helpOpen, setHelpOpen] = useState(false);
  const contentUrl = openProjectId ? `${BASE_URL}?open=${encodeURIComponent(openProjectId)}` : BASE_URL;

  const slotRef = useRef<HTMLDivElement>(null);
  const deviceRef = useRef<HTMLDivElement>(null);
  const aspect = isMobile ? PHONE_ASPECT : TABLET_ASPECT;
  const { isFull, expand, collapse, exitRef } = useDeviceFullscreen(deviceRef, slotRef, aspect);
  useImperativeHandle(ref, () => ({ expand, collapse, fullscreenBox: () => fitViewport(aspect) }), [
    expand,
    collapse,
    aspect,
  ]);

  // Ancho tope en vh para que la altura (que device-frame deriva del ancho vía
  // aspect-ratio en modo inline, ver Iphone_Clone/src/device-frame.ts) nunca
  // supere 100vh. Ratios exactos de Iphone_Clone/src/geometry.ts.
  const maxWidth = isMobile
    ? 'min(95vw, calc(100vh * 2500 / 4722))'
    : 'min(85vw, 1800px, calc(100vh * 1195 / 960))';

  return (
    <section className="flex flex-col items-center py-12 sm:py-20">
      <div style={{ width: maxWidth }}>
        {/* Hueco que conserva el tamaño mientras el dispositivo está ampliado. */}
        <div ref={slotRef}>
          <div
            id="tablet-frame"
            ref={deviceRef}
            tabIndex={-1}
            aria-label={isFull ? `${title}, pantalla completa` : undefined}
            onDoubleClick={() => (isFull ? collapse() : expand())}
          >
            <DeviceFrame
              mode="inline"
              device={isMobile ? 'phone' : 'tablet'}
              size="l"
              scale={2.5}
              contentUrl={contentUrl}
              background="transparent"
              controls={false}
              switcher={false}
              open
            />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button type="button" onClick={expand} className="r4-btn-ghost">
            <span aria-hidden="true">⛶</span> Pantalla completa
          </button>
          <button
            type="button"
            onClick={() => window.open(BASE_URL, '_blank', 'noopener,noreferrer')}
            className="rounded-full bg-accent px-[22px] py-[13px] font-display text-[15px] font-semibold text-bg transition hover:bg-white hover:-translate-y-px"
          >
            Abrir escritorio
          </button>
          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            className="rounded-full border border-neutral-800 px-[22px] py-[13px] font-display text-[15px] font-semibold transition hover:border-accent"
          >
            Ayuda
          </button>
        </div>
      </div>

      {/* Velo + barra de vidrio de la pantalla completa (siempre montados para
          poder hacer la transición de salida). */}
      <div
        className={`fixed inset-0 z-[999] bg-black/55 backdrop-blur-[var(--blur-overlay)] transition-opacity duration-[640ms] ease-liquid motion-reduce:transition-none ${
          isFull ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={collapse}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-label="Pantalla completa"
        aria-hidden={!isFull}
        className={`r4-glass fixed left-1/2 top-3.5 z-[1001] flex items-center gap-2.5 rounded-full !bg-[rgba(10,10,12,0.6)] py-1.5 pl-4 pr-1.5 transition-[opacity,translate] duration-[320ms] ease-spring motion-reduce:transition-none ${
          isFull ? '-translate-x-1/2 translate-y-0 opacity-100' : 'pointer-events-none -translate-x-1/2 -translate-y-5 opacity-0'
        }`}
      >
        <b className="font-display text-sm font-semibold">{title}</b>
        <kbd className="rounded-md border border-glass-edge px-1.5 py-0.5 font-mono text-[11px] text-ink-faint">Esc</kbd>
        <button
          ref={exitRef}
          type="button"
          onClick={collapse}
          tabIndex={isFull ? 0 : -1}
          className="r4-btn-ghost !px-3.5 !py-2 !text-[13px]"
        >
          Salir <span aria-hidden="true">✕</span>
        </button>
      </div>

      {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
    </section>
  );
});
