import bgImg from '../assets/hero-bg.png?w=1600&format=webp';
import { Nav } from '../components/Nav';
import { Hero } from '../components/Hero';
import { DeviceShowcase } from '../components/DeviceShowcase';
import { ProjectsCarousel } from '../components/ProjectsCarousel';
import { TechMarquee } from '../components/TechMarquee';
import { About } from '../components/About';

export function HomePage() {
  return (
    <div className="relative overflow-x-hidden font-body text-text">
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${bgImg})` }}
      />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(10,10,10,0.2)_0%,rgba(10,10,10,0.75)_100%)]" />
      <div className="relative z-10">
        <Nav />
        <Hero />
        <DeviceShowcase />
        <ProjectsCarousel />
        <TechMarquee />
        <About />
        {/* ContactForm/Footer se añaden en tareas siguientes */}
      </div>
    </div>
  );
}
