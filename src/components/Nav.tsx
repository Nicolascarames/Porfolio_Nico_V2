import { Link } from 'react-router-dom';
import { scrollToId } from '../lib/scroll';

export function Nav() {
  return (
    <nav className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-4 bg-bg/72 px-5 py-[18px] backdrop-blur-md sm:px-[60px]">
      <a href="#top" className="font-display text-2xl font-bold tracking-tighter text-text">
        Nico
      </a>
      <div className="flex flex-wrap items-center gap-4 sm:gap-7">
        <Link
          to="/login"
          className="order-first rounded-full bg-accent px-[18px] py-[9px] font-display text-sm font-semibold text-bg transition hover:bg-white hover:-translate-y-px"
        >
          Get Started
        </Link>
        <Link to="/login" className="text-sm font-semibold text-neutral-300 hover:text-white">
          Sign in
        </Link>
        <button
          type="button"
          onClick={() => scrollToId('contacto')}
          className="text-sm font-semibold text-neutral-300 hover:text-white"
        >
          Contacto
        </button>
        <button
          type="button"
          onClick={() => scrollToId('sobre-mi')}
          className="text-sm font-semibold text-neutral-300 hover:text-white"
        >
          Sobre mí
        </button>
      </div>
    </nav>
  );
}
