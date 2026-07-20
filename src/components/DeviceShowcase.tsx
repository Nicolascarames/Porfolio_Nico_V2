import { useState } from 'react';
import { DeviceFrame } from 'device-frame/react';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { HelpModal } from './HelpModal';

// /portfolio (no la raíz) es el punto de entrada público de Desktop_Nav: activa
// guestMode y no exige login. También lee ?open=<id> para abrir ese proyecto
// directamente en la ventana "Navegador" (ver PortfolioEntry.tsx en ese repo).
const BASE_URL = 'https://desktop-nav.vercel.app/portfolio';

interface DeviceShowcaseProps {
  openProjectId?: string | null;
}

export function DeviceShowcase({ openProjectId }: DeviceShowcaseProps) {
  const isMobile = useMediaQuery('(max-width: 820px)');
  const [helpOpen, setHelpOpen] = useState(false);
  const contentUrl = openProjectId ? `${BASE_URL}?open=${encodeURIComponent(openProjectId)}` : BASE_URL;

  // Ancho tope en vh para que la altura (que device-frame deriva del ancho vía
  // aspect-ratio en modo inline, ver Iphone_Clone/src/device-frame.ts) nunca
  // supere 100vh. Ratios exactos de Iphone_Clone/src/geometry.ts.
  const maxWidth = isMobile
    ? 'min(95vw, calc(100vh * 2500 / 4722))'
    : 'min(85vw, 1800px, calc(100vh * 1195 / 960))';

  return (
    <section className="flex flex-col items-center py-12 sm:py-20">
      <div style={{ width: maxWidth }}>
        <div id="tablet-frame">
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
        <div className="mt-6 flex justify-end gap-3">
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
      {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
    </section>
  );
}
