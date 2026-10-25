import babiaImg from '../assets/projects/babia.png?w=800&format=webp';
import sonaiImg from '../assets/projects/sonai.png?w=800&format=webp';
import aiNavCorpImg from '../assets/projects/ai-nav-corp.png?w=800&format=webp';
import desktopNavImg from '../assets/projects/desktop-nav.png?w=800&format=webp';

export interface Project {
  title: string;
  desc: string;
  /** Sin captura de pantalla todavía en algunos proyectos nuevos — opcional
   * para no romper la tarjeta mientras no exista el asset real. */
  img?: string;
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
  {
    title: 'CriptoFiscal',
    desc: 'App de registro de operaciones cripto e informes fiscales para España: FIFO por activo, conversión a EUR con tipo de cambio histórico, informe de IRPF exportable a PDF.',
    desktopNavId: 'criptofiscal',
  },
  {
    title: 'GiveMe',
    desc: 'Tarjetas de fidelización digitales para negocios: sellos por NFC o QR, Apple Wallet y Google Wallet, sin que el cliente instale nada.',
    externalUrl: 'https://givemewallet.com',
  },
  {
    title: 'Gastos del hogar',
    desc: 'App para llevar los gastos fijos de casa y repartirlos entre dos personas.',
    externalUrl: 'https://gastos.reality404.app',
  },
  {
    title: 'Agente QA',
    desc: 'CLI de QA: mapea una web, genera escenarios Gherkin, los convierte en tests de Playwright y saca reportes.',
    externalUrl: 'https://github.com/Nicolascarames/Agente_QA',
  },
  {
    title: 'Agente QA MCP',
    desc: 'QA agéntico sobre Playwright MCP: agentes de IA que navegan y prueban la web como lo haría una persona.',
    externalUrl: 'https://github.com/Nicolascarames/AGENTE-QA-MCP',
  },
  {
    title: 'QA Pruebas',
    desc: 'Ejercicios prácticos de QA y preparación del examen ISTQB.',
    externalUrl: 'https://github.com/Nicolascarames/QA_Pruebas',
  },
];
