import { DeviceFrame } from 'device-frame/react';
import { useMediaQuery } from '../hooks/useMediaQuery';

const CONTENT_URL = 'https://desktop-nav.vercel.app/';

export function DeviceShowcase() {
  const isMobile = useMediaQuery('(max-width: 820px)');

  return (
    <section className="flex justify-center py-12 sm:py-20">
      <div className={isMobile ? 'w-[95vw]' : 'w-[85vw] max-w-[1800px]'}>
        <DeviceFrame
          mode="inline"
          device={isMobile ? 'phone' : 'tablet'}
          size="l"
          scale={2.5}
          contentUrl={CONTENT_URL}
          background="transparent"
          controls={false}
          switcher={false}
          open
        />
      </div>
    </section>
  );
}
