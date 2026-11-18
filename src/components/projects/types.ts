import type { Project } from '../../data/projects';

/** Contrato común de las variantes de proyectos (Deck, Coverflow, Bento). */
export interface ProjectVariantProps {
  projects: Project[];
  /** `el` es la tarjeta pulsada: origen del vuelo hasta la tablet. */
  onSelectProject: (project: Project, el: HTMLElement) => void;
}
