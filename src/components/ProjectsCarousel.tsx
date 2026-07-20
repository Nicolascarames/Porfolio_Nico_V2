import type { Project } from '../data/projects';
import { projects } from '../data/projects';

interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
  decorative?: boolean;
}

function ProjectCard({ project, onSelect, decorative }: ProjectCardProps) {
  const { title, desc, img } = project;
  return (
    <button
      type="button"
      tabIndex={decorative ? -1 : undefined}
      aria-hidden={decorative || undefined}
      onClick={() => onSelect(project)}
      className="relative aspect-[3/2] w-[clamp(300px,34vw,440px)] shrink-0 overflow-hidden rounded-[22px] border border-neutral-800 text-left transition hover:border-neutral-600"
    >
      <img
        src={img}
        alt={title}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-top"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/35 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-[22px]">
        <h3 className="font-display text-[22px] font-semibold text-white">{title}</h3>
        <p className="mt-1.5 text-sm leading-snug text-neutral-300">{desc}</p>
      </div>
    </button>
  );
}

interface ProjectsCarouselProps {
  onSelectProject: (project: Project) => void;
}

export function ProjectsCarousel({ onSelectProject }: ProjectsCarouselProps) {
  return (
    <section className="border-t border-white/5 py-16 sm:py-[90px]">
      <div className="mb-8 px-5 sm:px-[60px]">
        <span className="font-display text-xs uppercase tracking-[0.12em] text-neutral-500">
          Proyectos
        </span>
        <h2 className="mt-2.5 font-display text-[clamp(28px,4vw,46px)] font-semibold tracking-tighter">
          Cosas que he construido
        </h2>
      </div>
      <div className="overflow-hidden [-webkit-mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)] [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
        <div className="marquee-track flex w-max animate-[marqL_55s_linear_infinite]">
          <div className="flex gap-6 pr-6">
            {projects.map((p) => (
              <ProjectCard key={p.title} project={p} onSelect={onSelectProject} />
            ))}
          </div>
          <div className="flex gap-6 pr-6" aria-hidden="true">
            {projects.map((p) => (
              <ProjectCard key={`${p.title}-dup`} project={p} onSelect={onSelectProject} decorative />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
