import type { ReactNode } from 'react';
import { tech } from '../../data/tech';
import { sections } from '../../config/sections';
import { TechPhysicsBox } from './TechPhysicsBox';
import { TechStackTower } from './TechStackTower';
import { TechMagnetCloud } from './TechMagnetCloud';
import type { TechVariantProps } from './types';

const VARIANTS = {
  physics: TechPhysicsBox,
  tower: TechStackTower,
  magnet: TechMagnetCloud,
} satisfies Record<typeof sections.tech, (props: TechVariantProps) => JSX.Element>;

function renderHead(actions?: ReactNode) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <span className="r4-eyebrow">Stack</span>
        <h2 className="r4-title mt-2.5 text-[clamp(28px,4vw,46px)]">Tecnologías</h2>
      </div>
      {actions}
    </div>
  );
}

/** Sección de tecnologías: la variante de config/sections.ts. */
export function TechSection() {
  const Variant = VARIANTS[sections.tech];
  return (
    <section id="stack" className="border-t border-white/5 py-16 sm:py-[90px]">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-[60px]">
        <Variant tech={tech} renderHead={renderHead} />
      </div>
    </section>
  );
}
