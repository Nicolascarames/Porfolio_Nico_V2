import { useRef, useState, type PointerEvent } from 'react';
import { ProjectMedia } from '../ui/ProjectMedia';
import { prefersReducedMotion } from '../../hooks/useReducedMotion';
import type { Project } from '../../data/projects';
import type { ProjectVariantProps } from './types';
import './projects.css';

/**
 * Rejilla bento de vidrio: cada tarjeta se inclina en 3D siguiendo al ratón
 * con brillo especular, y el vídeo arranca en hover o foco. Port de
 * Diseño_claude_desing/reality404-v2/components/ProjectBento/preview.html.
 * Spans (t0…t4): 2×2, 2×1, 1×1, 1×2, 2×1 sobre 4 columnas de 150 px.
 */

const MAX_TILT_X = 10; // grados
const MAX_TILT_Y = 12;

interface TileProps {
  project: Project;
  index: number;
  onSelect: ProjectVariantProps['onSelectProject'];
}

function Tile({ project, index, onSelect }: TileProps) {
  const [playing, setPlaying] = useState(false);
  const raf = useRef(0);

  function onPointerMove(e: PointerEvent<HTMLButtonElement>) {
    if (prefersReducedMotion()) return;
    const t = e.currentTarget;
    const r = t.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      t.style.transform = `rotateX(${(0.5 - y) * MAX_TILT_X}deg) rotateY(${(x - 0.5) * MAX_TILT_Y}deg) translateZ(10px)`;
      t.style.setProperty('--gx', `${x * 100}%`);
      t.style.setProperty('--gy', `${y * 100}%`);
    });
  }

  function onPointerLeave(e: PointerEvent<HTMLButtonElement>) {
    cancelAnimationFrame(raf.current);
    e.currentTarget.style.transform = '';
    setPlaying(false);
  }

  const span = index < 5 ? `t${index}` : '';

  return (
    <button
      type="button"
      className={`tile r4-glass ${span} ${index === 0 ? 'big' : ''}`}
      aria-label={`Abrir ${project.title} en la tablet`}
      onPointerEnter={() => setPlaying(true)}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onFocus={() => setPlaying(true)}
      onBlur={() => setPlaying(false)}
      onClick={(e) => onSelect(project, e.currentTarget)}
    >
      <ProjectMedia project={project} playing={playing} />
      <div className="pv-shade" />
      <div className="glare" />
      <span className="arrow" aria-hidden="true">
        →
      </span>
      <div className="meta">
        <h3>{project.title}</h3>
        <p>{project.desc}</p>
      </div>
    </button>
  );
}

export function ProjectBento({ projects, onSelectProject }: ProjectVariantProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="bento">
        {projects.map((p, i) => (
          <Tile key={p.id} project={p} index={i} onSelect={onSelectProject} />
        ))}
      </div>
      <p className="r4-hint">Pasa el ratón: tilt + brillo + vídeo · clic para abrir en la tablet</p>
    </div>
  );
}
