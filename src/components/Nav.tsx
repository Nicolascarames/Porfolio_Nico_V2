import { Link, useLocation, useNavigate } from 'react-router-dom';
import { scrollToId } from '../lib/scroll';
import { useAuth } from '../auth-kit/hooks/useAuth';

export function Nav() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();

  async function handleLogout() {
    await signOut();
    navigate('/');
  }

  return (
    <nav className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-4 bg-bg/72 px-5 py-[18px] backdrop-blur-md sm:px-[60px]">
      <a href="#top" className="font-display text-2xl font-bold tracking-tighter text-text">
        Nico
      </a>
      <div className="flex flex-wrap items-center gap-4 sm:gap-7">
        {isHome && (
          <>
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
          </>
        )}
        {!loading &&
          (user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="nav-cta rounded-full bg-accent px-[18px] py-[9px] font-display text-sm font-semibold transition hover:bg-white hover:-translate-y-px"
            >
              Cerrar sesión
            </button>
          ) : (
            <Link
              to="/login"
              className="nav-cta rounded-full bg-accent px-[18px] py-[9px] font-display text-sm font-semibold transition hover:bg-white hover:-translate-y-px"
            >
              Privado
            </Link>
          ))}
      </div>
    </nav>
  );
}
