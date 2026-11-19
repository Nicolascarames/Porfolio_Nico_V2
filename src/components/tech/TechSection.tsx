import type { ReactNode } from 'react';
import { tech } from '../../data/tech';
import { useSections } from '../../context/SectionsContext';
import type { SectionsConfig } from '../../config/sections';
import { useStoredChoice } from '../../hooks/useStoredChoice';
import { SegmentedControl } from '../ui/SegmentedControl';
import { TechPhysicsBox } from './TechPhysicsBox';
import { TechStackTower } from './TechStackTower';
import { TechMagnetCloud } from './TechMagnetCloud';
import type { TechVariantProps } from './types';

const VARIANTS = {
  physics: TechPhysicsBox,
  tower: TechStackTower,
  magnet: TechMagnetCloud,
} satisfies Record<SectionsConfig['tech'], (props: TechVariantProps) => JSX.Element>;

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

type Choice = SectionsConfig['tech'];
const OPTIONS: readonly { value: Choice; label: string }[] = [
  { value: 'physics', label: 'Caja' },
  { value: 'tower', label: 'Torre' },
  { value: 'magnet', label: 'Nube' },
];
const CHOICES = OPTIONS.map((o) => o.value);

/** Sección de tecnologías: el visitante elige variante; config/sections.ts fija la inicial. */
export function TechSection() {
  const sections = useSections();
  // key: al llegar el valor remoto se remonta para tomar el nuevo defecto (la elección guardada del visitante sigue ganando).
  return <TechSectionInner key={sections.tech} initial={sections.tech} />;
}

function TechSectionInner({ initial }: { initial: Choice }) {
  const [choice, setChoice] = useStoredChoice<Choice>('r4-tech-variant', CHOICES, initial);
  const Variant = VARIANTS[choice];
  return (
    <section id="stack" className="border-t border-white/5 py-16 sm:py-[90px]">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-[60px]">
        <div className="mb-6 flex justify-end">
          <SegmentedControl label="Vista de tecnologías" options={OPTIONS} value={choice} onChange={setChoice} />
        </div>
        <Variant tech={tech} renderHead={renderHead} />
      </div>
    </section>
  );
}
