import babiaImg from '../assets/projects/babia.png?w=800&format=webp';
import sonaiImg from '../assets/projects/sonai.png?w=800&format=webp';
import aiNavCorpImg from '../assets/projects/ai-nav-corp.png?w=800&format=webp';
import desktopNavImg from '../assets/projects/desktop-nav.png?w=800&format=webp';

export interface Project {
  title: string;
  desc: string;
  img: string;
  /** Id del proyecto en Desktop_Nav (src/data/projects.ts de ese repo). Si
   * está presente, el click abre el proyecto dentro de la Tablet en vez de
   * en otra pestaña. Se omite quien no tenga ventana propia allí (Desktop
   * Nav es la propia app que se muestra dentro de la Tablet). */
  desktopNavId?: string;
}

export const projects: Project[] = [
  {
    title: 'BabIA',
    desc: 'App para el sueño de tu bebé: registro, evolución e integración con Telegram.',
    img: babiaImg,
    desktopNavId: 'babia',
  },
  {
    title: 'SonAI',
    desc: 'Landing page para vender automatizaciones por voz con IA.',
    img: sonaiImg,
    desktopNavId: 'sonai',
  },
  {
    title: 'AI Nav Corp',
    desc: 'Juego en pixel art y portfolio jugable: cada personaje integra una IA y una misión.',
    img: aiNavCorpImg,
    desktopNavId: 'ai-nav-corp',
  },
  {
    title: 'Desktop Nav',
    desc: 'Simula un escritorio en la web, con IA y flujos de trabajo integrados.',
    img: desktopNavImg,
  },
];
