import { Link } from 'react-router-dom';
import { scrollToId } from '../lib/scroll';

export function Hero() {
  return (
    <section id="top" className="flex flex-col px-5 pt-10 sm:px-[60px] sm:pt-20">
      <div className="max-w-[1000px]">
        <h1 className="text-balance font-display text-[clamp(42px,7.5vw,96px)] font-bold leading-[0.98] tracking-tighter">
          Developer, design
          <br />
          and workflows
          <br />
          with AI
        </h1>
      </div>
      <div className="mt-7 flex flex-wrap items-end justify-between gap-7 sm:mt-13">
        <p className="max-w-[560px] text-pretty text-base leading-relaxed text-neutral-400 sm:text-lg">
          Construyo productos digitales de principio a fin: interfaces limpias, código
          mantenible y experiencias potenciadas por inteligencia artificial. Combino desarrollo,
          QA y automatización de flujos de trabajo para lanzar más rápido y con mayor calidad.
        </p>
        <div className="flex gap-3">
          <Link
            to="/login"
            className="rounded-full bg-accent px-[22px] py-[13px] font-display text-[15px] font-semibold text-bg transition hover:bg-white hover:-translate-y-px"
          >
            Get Started →
          </Link>
          <button
            type="button"
            onClick={() => scrollToId('contacto')}
            className="rounded-full border border-neutral-800 px-[22px] py-[13px] font-display text-[15px] font-semibold transition hover:border-accent"
          >
            Contacto
          </button>
        </div>
      </div>
    </section>
  );
}
