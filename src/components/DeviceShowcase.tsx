import { DeviceFrame } from 'device-frame/react';
import { useMediaQuery } from '../hooks/useMediaQuery';

const CONTENT_URL = 'https://desktop-nav.vercel.app/';

export function DeviceShowcase() {
  const isMobile = useMediaQuery('(max-width: 820px)');

  return (
    <section className="flex justify-center py-12 sm:py-20">
      <div className="w-full max-w-[640px] px-5">
        <DeviceFrame
          mode="inline"
          device={isMobile ? 'phone' : 'tablet'}
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
