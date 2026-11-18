import { useRef, useState } from 'react';
import { Hero } from '../components/Hero';
import { DeviceShowcase, type DeviceShowcaseHandle } from '../components/DeviceShowcase';
import { ProjectsSection } from '../components/projects/ProjectsSection';
import { TechSection } from '../components/tech/TechSection';
import { AboutSection } from '../components/about/AboutSection';
import { ContactSection } from '../components/contact/ContactSection';
import { Footer } from '../components/Footer';
import { scrollToId } from '../lib/scroll';
import type { Project } from '../data/projects';

export function HomePage() {
  const [openProjectId, setOpenProjectId] = useState<string | null>(null);
  const [openTitle, setOpenTitle] = useState('reality404');
  const deviceRef = useRef<DeviceShowcaseHandle>(null);

  function handleSelectProject(project: Project, el: HTMLElement) {
    // Coreografía elegida 2026-11-18: sin clon, el dispositivo ampliado sale
    // de la caja de la tarjeta (escala uniforme) mientras la tarjeta se funde.
    const cardBox = el.getBoundingClientRect();
    setOpenProjectId(project.desktopNavId ?? null);
    setOpenTitle(project.title);
    // Alinea el borde inferior del dispositivo con el de la pantalla para que,
    // al salir de pantalla completa, vuelva a un hueco visible entero.
    scrollToId('tablet-frame', { align: 'bottom' });
    deviceRef.current?.expand({ kind: 'from', box: cardBox });
    el.animate?.([{ opacity: 1 }, { opacity: 0 }], { duration: 320, easing: 'ease-out' });
  }

  return (
    <div className="relative overflow-x-hidden font-body text-text">
      <div className="r4-stage-bg" aria-hidden="true" />
      {/* Sin z-index propio a propósito: así la pantalla completa del
          dispositivo (fixed, z 999-1001) queda por encima del nav (z-50). */}
      <div className="relative">
        <Hero />
        <DeviceShowcase ref={deviceRef} openProjectId={openProjectId} title={openTitle} />
        <ProjectsSection onSelectProject={handleSelectProject} />
        <TechSection />
        <AboutSection />
        <ContactSection />
        <Footer />
      </div>
    </div>
  );
}
