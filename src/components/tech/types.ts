import type { ReactNode } from 'react';
import type { Tech } from '../../data/tech';

/** Contrato común de las variantes de tecnologías. `renderHead` pinta la
 * cabecera de la sección (STACK / Tecnologías) con los controles propios de
 * cada variante a la derecha. */
export interface TechVariantProps {
  tech: Tech[];
  renderHead: (actions?: ReactNode) => ReactNode;
}
