import { useEffect, useRef } from 'react';
import type { Project } from '../../data/projects';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface ProjectMediaProps {
  project: Pick<Project, 'img' | 'video'>;
  /** Activa la reproducción (vídeo) o el barrido lento (captura). */
  playing: boolean;
  className?: string;
}

/**
 * Medio de proyecto (port de R4.media): <video muted loop> si hay vídeo;
 * si no, la captura con barrido lento y etiqueta PREVIEW; sin captura, un
 * placeholder "404". Se coloca dentro de un contenedor `relative overflow-hidden`.
 */
export function ProjectMedia({ project, playing, className = '' }: ProjectMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (playing && !reduced) v.play().catch(() => {});
    else v.pause();
  }, [playing, reduced]);

  let media;
  if (project.video) {
    media = (
      <video
        ref={videoRef}
        className="r4-media"
        src={project.video}
        poster={project.img}
        muted
        loop
        playsInline
        preload="metadata"
      />
    );
  } else if (project.img) {
    media = <img className="r4-media r4-media-img" src={project.img} alt="" draggable={false} loading="lazy" />;
  } else {
    media = (
      <div className="r4-media grid place-items-center bg-[radial-gradient(circle_at_50%_40%,#1b1c22,#050506)]">
        <span className="r4-frost-text font-display text-[56px] font-bold leading-none tracking-[-0.04em]">404</span>
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 overflow-hidden ${playing ? 'r4-playing' : ''} ${className}`}>
      {media}
      <div className="r4-sheen" />
      <span className="r4-live">{project.video ? 'Vídeo' : 'Preview'}</span>
    </div>
  );
}
