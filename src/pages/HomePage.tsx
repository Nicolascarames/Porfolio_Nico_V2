import { useState } from 'react';
import { Hero } from '../components/Hero';
import { DeviceShowcase } from '../components/DeviceShowcase';
import { ProjectsCarousel } from '../components/ProjectsCarousel';
import { TechMarquee } from '../components/TechMarquee';
import { About } from '../components/About';
import { ContactForm } from '../components/ContactForm';
import { Footer } from '../components/Footer';
import { scrollToId } from '../lib/scroll';
import type { Project } from '../data/projects';

export function HomePage() {
  const [openProjectId, setOpenProjectId] = useState<string | null>(null);

  function handleSelectProject(project: Project) {
    setOpenProjectId(project.desktopNavId ?? null);
    // Alinea el borde inferior de la Tablet (no del bloque de botones) con
    // el borde inferior de la pantalla: puede ocupar hasta 100vh, así que
    // alinear por arriba la dejaría recortada por abajo.
    scrollToId('tablet-frame', { align: 'bottom' });
  }

  return (
    <div className="relative overflow-x-hidden font-body text-text">
      <div className="r4-stage-bg" aria-hidden="true" />
      <div className="relative z-10">
        <Hero />
        <DeviceShowcase openProjectId={openProjectId} />
        <ProjectsCarousel onSelectProject={handleSelectProject} />
        <TechMarquee />
        <About />
        <ContactForm />
        <Footer />
      </div>
    </div>
  );
}
