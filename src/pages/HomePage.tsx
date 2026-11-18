import { useRef, useState } from 'react';
import { Hero } from '../components/Hero';
import { DeviceShowcase, type DeviceShowcaseHandle } from '../components/DeviceShowcase';
import { ProjectsCarousel } from '../components/ProjectsCarousel';
import { TechMarquee } from '../components/TechMarquee';
import { About } from '../components/About';
import { ContactForm } from '../components/ContactForm';
import { Footer } from '../components/Footer';
import { scrollToId } from '../lib/scroll';
import type { Project } from '../data/projects';

export function HomePage() {
  const [openProjectId, setOpenProjectId] = useState<string | null>(null);
  const [openTitle, setOpenTitle] = useState('reality404');
  const deviceRef = useRef<DeviceShowcaseHandle>(null);

  function handleSelectProject(project: Project) {
    setOpenProjectId(project.desktopNavId ?? null);
    setOpenTitle(project.title);
    // Alinea el borde inferior de la Tablet (no del bloque de botones) con
    // el borde inferior de la pantalla: puede ocupar hasta 100vh, así que
    // alinear por arriba la dejaría recortada por abajo.
    scrollToId('tablet-frame', { align: 'bottom' });
    deviceRef.current?.expand();
  }

  return (
    <div className="relative overflow-x-hidden font-body text-text">
      <div className="r4-stage-bg" aria-hidden="true" />
      {/* Sin z-index propio a propósito: así la pantalla completa del
          dispositivo (fixed, z 999-1001) queda por encima del nav (z-50). */}
      <div className="relative">
        <Hero />
        <DeviceShowcase ref={deviceRef} openProjectId={openProjectId} title={openTitle} />
        <ProjectsCarousel onSelectProject={handleSelectProject} />
        <TechMarquee />
        <About />
        <ContactForm />
        <Footer />
      </div>
    </div>
  );
}
