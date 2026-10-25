import { useState } from 'react';
import bgImg from '../assets/fondoSicodelico.jpg?w=1600&format=webp';
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
    if (project.externalUrl) {
      window.open(project.externalUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    setOpenProjectId(project.desktopNavId ?? null);
    // Alinea el borde inferior de la Tablet (no del bloque de botones) con
    // el borde inferior de la pantalla: puede ocupar hasta 100vh, así que
    // alinear por arriba la dejaría recortada por abajo.
    scrollToId('tablet-frame', { align: 'bottom' });
  }

  return (
    <div className="relative overflow-x-hidden font-body text-text">
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${bgImg})` }}
      />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(10,10,10,0.2)_0%,rgba(10,10,10,0.75)_100%)]" />
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
