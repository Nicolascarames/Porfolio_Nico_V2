import babiaImg from '../assets/projects/babia.png?w=800&format=webp';
import sonaiImg from '../assets/projects/sonai.png?w=800&format=webp';
import aiNavCorpImg from '../assets/projects/ai-nav-corp.png?w=800&format=webp';
import desktopNavImg from '../assets/projects/desktop-nav.png?w=800&format=webp';

export interface Project {
  /** Identificador estable (clave de React, data-id en las variantes). */
  id: string;
  title: string;
  desc: string;
  /** Etiquetas cortas que muestran las variantes de proyectos. */
  tags: string[];
  /** Sin captura de pantalla todavía en algunos proyectos nuevos — opcional
   * para no romper la tarjeta mientras no exista el asset real. */
  img?: string;
  /** Vídeo muted loop (mp4/webm) en `public/videos/`, p. ej. '/videos/babia.mp4'.
   * Sin vídeo, ProjectMedia usa la captura con barrido lento + PREVIEW. */
  video?: string;
  /** Id del proyecto en Desktop_Nav (src/data/projects.ts de ese repo). Si
   * está presente, el click abre el proyecto dentro de la Tablet en vez de
   * en otra pestaña. Se omite quien no tenga ventana propia allí (Desktop
   * Nav es la propia app que se muestra dentro de la Tablet). */
  desktopNavId?: string;
  /** Proyectos que no pueden abrirse dentro de la Tablet (bloquean iframes,
   * exigen login o no tienen web): el click los abre en pestaña nueva. */
  externalUrl?: string;
}

export const projects: Project[] = [
  {
    id: 'babia',
    title: 'BabIA',
    desc: 'App para el sueño de tu bebé: registro, evolución e integración con Telegram.',
    tags: ['React', 'Supabase', 'Telegram'],
    img: babiaImg,
    desktopNavId: 'babia',
  },
  {
    id: 'sonai',
    title: 'SonAI',
    desc: 'Landing page para vender automatizaciones por voz con IA.',
    tags: ['Landing', 'Voz IA'],
    img: sonaiImg,
    desktopNavId: 'sonai',
  },
  {
    id: 'ai-nav-corp',
    title: 'AI Nav Corp',
    desc: 'Juego en pixel art y portfolio jugable: cada personaje integra una IA y una misión.',
    tags: ['Phaser', 'IA'],
    img: aiNavCorpImg,
    desktopNavId: 'ai-nav-corp',
  },
  {
    id: 'desktop-nav',
    title: 'Desktop Nav',
    desc: 'Simula un escritorio en la web, con IA y flujos de trabajo integrados.',
    tags: ['React', 'Workflows'],
    img: desktopNavImg,
  },
  {
    id: 'criptofiscal',
    title: 'CriptoFiscal',
    desc: 'App de registro de operaciones cripto e informes fiscales para España: FIFO por activo, conversión a EUR con tipo de cambio histórico, informe de IRPF exportable a PDF.',
    tags: ['Fiscalidad', 'PDF'],
    desktopNavId: 'criptofiscal',
  },
  {
    id: 'giveme',
    title: 'GiveMe',
    desc: 'Tarjetas de fidelización digitales para negocios: sellos por NFC o QR, Apple Wallet y Google Wallet, sin que el cliente instale nada.',
    tags: ['Fidelización', 'Wallet'],
    externalUrl: 'https://givemewallet.com',
  },
  {
    id: 'gastos-hogar',
    title: 'Gastos del hogar',
    desc: 'App para llevar los gastos fijos de casa y repartirlos entre dos personas.',
    tags: ['Finanzas', 'Hogar'],
    externalUrl: 'https://gastos.reality404.app',
  },
  {
    id: 'agente-qa',
    title: 'Agente QA',
    desc: 'CLI de QA: mapea una web, genera escenarios Gherkin, los convierte en tests de Playwright y saca reportes.',
    tags: ['QA', 'Playwright'],
    externalUrl: 'https://github.com/Nicolascarames/Agente_QA',
  },
  {
    id: 'agente-qa-mcp',
    title: 'Agente QA MCP',
    desc: 'QA agéntico sobre Playwright MCP: agentes de IA que navegan y prueban la web como lo haría una persona.',
    tags: ['QA', 'MCP'],
    externalUrl: 'https://github.com/Nicolascarames/AGENTE-QA-MCP',
  },
  {
    id: 'qa-pruebas',
    title: 'QA Pruebas',
    desc: 'Ejercicios prácticos de QA y preparación del examen ISTQB.',
    tags: ['QA', 'ISTQB'],
    externalUrl: 'https://github.com/Nicolascarames/QA_Pruebas',
  },
];
