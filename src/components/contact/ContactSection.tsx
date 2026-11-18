import { sections } from '../../config/sections';
import { ContactGlass } from './ContactGlass';
import { ContactChat } from './ContactChat';
import { ContactTerminal } from './ContactTerminal';

const VARIANTS = {
  glass: ContactGlass,
  chat: ContactChat,
  terminal: ContactTerminal,
} satisfies Record<typeof sections.contact, () => JSX.Element>;

/** Sección de contacto: la variante de config/sections.ts (cada una lleva su cabecera). */
export function ContactSection() {
  const Variant = VARIANTS[sections.contact];
  return (
    <section id="contacto" className="border-t border-white/5 py-16 sm:py-[90px]">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-[60px]">
        <Variant />
      </div>
    </section>
  );
}
