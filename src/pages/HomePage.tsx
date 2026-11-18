import { useRef, useState } from 'react';
import { Hero } from '../components/Hero';
import { DeviceShowcase, type DeviceShowcaseHandle } from '../components/DeviceShowcase';
import { ProjectsSection } from '../components/projects/ProjectsSection';
import { flyTo } from '../lib/flyTo';
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

  const flying = useRef(false);

  async function handleSelectProject(project: Project, el: HTMLElement) {
    if (flying.current) return;
    // La tarjeta vuela al centro de la pantalla, a la caja que ocupará la
    // tablet ampliada: así el vuelo siempre se ve aunque la tablet esté fuera
    // de pantalla, y empalma con la ampliación (decisión 2026-11-18).
    // Instantáneo con reduced motion.
    const target = deviceRef.current?.fullscreenBox() ?? document.getElementById('tablet-frame');
    if (target) {
      flying.current = true;
      await flyTo(el, target);
      flying.current = false;
    }
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
        <ProjectsSection onSelectProject={handleSelectProject} />
        <TechSection />
        <AboutSection />
        <ContactSection />
        <Footer />
      </div>
    </div>
  );
}
