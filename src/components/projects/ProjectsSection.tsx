import { projects } from '../../data/projects';
import { sections } from '../../config/sections';
import { ProjectDeck } from './ProjectDeck';
import { ProjectCoverflow } from './ProjectCoverflow';
import { ProjectBento } from './ProjectBento';
import type { ProjectVariantProps } from './types';

const VARIANTS = {
  deck: ProjectDeck,
  coverflow: ProjectCoverflow,
  bento: ProjectBento,
} satisfies Record<typeof sections.projects, (props: ProjectVariantProps) => JSX.Element>;

interface ProjectsSectionProps {
  onSelectProject: ProjectVariantProps['onSelectProject'];
}

/** Sección de proyectos: cabecera común + la variante de config/sections.ts. */
export function ProjectsSection({ onSelectProject }: ProjectsSectionProps) {
  const Variant = VARIANTS[sections.projects];
  return (
    <section id="proyectos" className="border-t border-white/5 py-16 sm:py-[90px]">
      <div className="mb-8 px-5 sm:px-[60px]">
        <span className="r4-eyebrow">Proyectos</span>
        <h2 className="r4-title mt-2.5 text-[clamp(28px,4vw,46px)]">Cosas que he construido</h2>
      </div>
      <div className="mx-auto max-w-[1200px] px-5 sm:px-[60px]">
        <Variant projects={projects} onSelectProject={onSelectProject} />
      </div>
    </section>
  );
}
