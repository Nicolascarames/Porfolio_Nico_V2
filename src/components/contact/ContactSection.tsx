import { sections } from '../../config/sections';
import { useStoredChoice } from '../../hooks/useStoredChoice';
import { SegmentedControl } from '../ui/SegmentedControl';
import { ContactGlass } from './ContactGlass';
import { ContactChat } from './ContactChat';
import { ContactTerminal } from './ContactTerminal';

const VARIANTS = {
  glass: ContactGlass,
  chat: ContactChat,
  terminal: ContactTerminal,
} satisfies Record<typeof sections.contact, () => JSX.Element>;

// Variantes que el visitante puede elegir (el chat solo por config).
const OPTIONS = [
  { value: 'terminal', label: 'Terminal' },
  { value: 'glass', label: 'Formulario' },
] as const;
type Choice = (typeof OPTIONS)[number]['value'];
const CHOICES = OPTIONS.map((o) => o.value);

/**
 * Sección de contacto (cada variante lleva su cabecera). El visitante elige
 * terminal o formulario; config/sections.ts fija el valor inicial, y si ahí
 * está 'chat' se muestra el chat sin selector.
 */
export function ContactSection() {
  const configured = sections.contact;
  const selectable = (CHOICES as readonly string[]).includes(configured);
  const [choice, setChoice] = useStoredChoice<Choice>(
    'r4-contact-variant',
    CHOICES,
    selectable ? (configured as Choice) : 'terminal',
  );
  const Variant = VARIANTS[selectable ? choice : configured];
  return (
    <section id="contacto" className="border-t border-white/5 py-16 sm:py-[90px]">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-[60px]">
        {selectable && (
          <div className="mb-6 flex justify-end">
            <SegmentedControl label="Forma de contacto" options={OPTIONS} value={choice} onChange={setChoice} />
          </div>
        )}
        <Variant />
      </div>
    </section>
  );
}
