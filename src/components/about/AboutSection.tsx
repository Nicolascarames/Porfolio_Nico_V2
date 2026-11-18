import { sections } from '../../config/sections';
import { AboutBadge } from './AboutBadge';
import { AboutBento } from './AboutBento';
import { AboutTerminal } from './AboutTerminal';

const VARIANTS = {
  badge: AboutBadge,
  bento: AboutBento,
  terminal: AboutTerminal,
} satisfies Record<typeof sections.about, () => JSX.Element>;

/** Sección "Sobre mí": la variante de config/sections.ts. */
export function AboutSection() {
  const Variant = VARIANTS[sections.about];
  return (
    <section id="sobre-mi" className="border-t border-white/5 py-16 sm:py-[90px]">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-[60px]">
        <Variant />
      </div>
    </section>
  );
}
