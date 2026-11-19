/**
 * Variante por defecto de cada sección (rediseño reality404 v2).
 * Estos valores son los DEFAULTS: la pestaña de admin /admin/sections los
 * sobrescribe guardando en la tabla `portfolio.site_config` (fila id=1,
 * columna `data`), que se lee al cargar el sitio (SectionsContext) y se
 * cachea en localStorage. Lo que no esté en site_config (o sea inválido)
 * cae a estos valores. Tech y contacto llevan además un
 * selector visible: la variante con la que arrancan viene de aquí/admin, y la que
 * elija el visitante se recuerda en su navegador (localStorage), por lo que
 * un cambio aquí no se nota en un navegador que ya eligió otra. Contacto
 * solo ofrece terminal y formulario (glass); con 'chat' no sale selector.
 *
 * ── Cómo cambiar la variante por defecto (en código) ─────────────────────
 *
 * 1. Busca abajo la sección que quieres cambiar (p. ej. `projects`).
 * 2. Sustituye el valor entre comillas por una de las opciones de su lista.
 *    Ejemplo, para pasar proyectos de bento a la baraja:
 *
 *        projects: 'bento'  →  projects: 'deck'
 *
 *    Solo vale un valor de la lista que hay detrás de `as`; si escribes otro,
 *    TypeScript lo marca en rojo y `npm run build` falla, así que no se
 *    puede publicar por error una variante que no existe.
 * 3. Guarda. Con `npm run dev` abierto, el navegador se recarga solo.
 * 4. Para publicarlo: commit + push a main (Vercel despliega solo).
 *    (Lo normal es cambiarlo desde /admin/sections, sin desplegar.)
 *
 * ── Qué es cada opción ───────────────────────────────────────────────────
 *
 * projects (sección "Proyectos"):
 *   'deck'      Baraja en abanico: se arrastra y se lanza la tarjeta.
 *               Buena para pocos proyectos (hasta ~8) y en móvil.
 *   'coverflow' Carrusel 3D: la central se agranda y las laterales giran.
 *               Arrastre con inercia, rueda del ratón y flechas.
 *   'bento'     Rejilla con todos los proyectos a la vez; se inclinan con el
 *               ratón. El primer proyecto ocupa la tarjeta grande.
 *
 * tech (sección "Stack / Tecnologías"):
 *   'physics'   Caja con física real: las fichas caen, se apilan, se cogen
 *               y se lanzan. Botones "Agitar caja" e "Invertir gravedad".
 *   'tower'     Pirámide de 16 fichas que se derriba (bola, empujones) y se
 *               reconstruye sola. La más "juego". En móvil usa bloques más pequeños.
 *   'magnet'    Nube de iconos flotando con hilos de luz; el cursor los
 *               repele o atrae. Sin motor de física (la más ligera).
 *
 * about (sección "Sobre mí"):
 *   'badge'     Credencial de vidrio colgada de una cinta: se arrastra, se
 *               balancea y al hacer clic gira para mostrar el reverso.
 *   'bento'     La información en piezas: foto, bio, disponible, hora local,
 *               nº de proyectos, stack diario y ciclo de trabajo.
 *   'terminal'  Terminal que escribe sola la bio y luego acepta comandos.
 *
 * device (el dispositivo que muestra Desktop_Nav y se amplía al abrir un proyecto):
 *   'mock'      Marco CSS del mock de Claude Design: tablet 4:3 / móvil 1:2.
 *               Ampliado ocupa toda la pantalla, sin bisel. (Elegido 2026-11-18.)
 *   'real'      Tablet/iPhone de Iphone_Clone (device-frame), con su puente de
 *               rueda del ratón. Ampliado se centra conservando el marco.
 *
 * aboutTerminal (true/false): añade la terminal con IA debajo de la variante de
 *   "Sobre mí" (se ignora si about ya es 'terminal').
 *
 * contact (sección "Contacto"; las tres envían de verdad a /api/contact):
 *   'glass'     Formulario de vidrio clásico (nombre, email, mensaje).
 *   'chat'      Conversación: el formulario pregunta campo a campo.
 *   'terminal'  Terminal: el mensaje se escribe como comandos.
 */
export const SECTION_OPTIONS = {
  projects: ['deck', 'coverflow', 'bento'],
  tech: ['physics', 'tower', 'magnet'],
  about: ['badge', 'bento', 'terminal'],
  contact: ['glass', 'chat', 'terminal'],
  device: ['mock', 'real'],
} as const;

type OptionKey = keyof typeof SECTION_OPTIONS;

export type SectionsConfig = {
  [K in OptionKey]: (typeof SECTION_OPTIONS)[K][number];
} & { aboutTerminal: boolean };

export const DEFAULT_SECTIONS: SectionsConfig = {
  projects: 'coverflow',
  tech: 'physics',
  about: 'badge',
  aboutTerminal: true,
  contact: 'terminal',
  device: 'mock',
};

/** Fusiona un valor desconocido (JSON de site_config) sobre los defaults, aceptando solo valores válidos. */
export function parseSections(raw: unknown): SectionsConfig {
  const out: SectionsConfig = { ...DEFAULT_SECTIONS };
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  const src = raw as Record<string, unknown>;
  for (const key of Object.keys(SECTION_OPTIONS) as OptionKey[]) {
    const v = src[key];
    if (typeof v === 'string' && (SECTION_OPTIONS[key] as readonly string[]).includes(v)) {
      (out as Record<string, unknown>)[key] = v;
    }
  }
  if (typeof src.aboutTerminal === 'boolean') out.aboutTerminal = src.aboutTerminal;
  return out;
}
