/**
 * Variante activa de cada sección (rediseño reality404 v2).
 * Decisión: se elige solo aquí, sin selector visible para el visitante.
 *
 * ── Cómo cambiar la variante por defecto ─────────────────────────────────
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
 * (Las secciones de tecnologías, sobre mí y contacto se añadirán aquí en
 * sus fases, con el mismo formato.)
 */
export const sections = {
  projects: 'bento' as 'deck' | 'coverflow' | 'bento',
};
