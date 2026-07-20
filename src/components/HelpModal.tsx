import { useEffect } from 'react';
import { X } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

export function HelpModal({ onClose }: HelpModalProps) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-modal-title"
        className="w-full max-w-md rounded-[22px] border border-neutral-800 bg-bg p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h3 id="help-modal-title" className="font-display text-xl font-semibold text-text">
            ¿Qué es esto?
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="shrink-0 text-neutral-400 transition hover:text-text"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-neutral-300">
          Lo que ves ahí arriba es <strong className="font-semibold text-text">Desktop Nav</strong>,
          un proyecto mío: un escritorio simulado dentro del navegador donde publico todo lo que
          quiero mostrar de mí — mis proyectos, mi CV, cómo contactarme y más.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-neutral-300">
          Funciona como un ordenador de verdad: abre iconos del escritorio y muévelos, cambia su
          tamaño o ciérralos, cada uno en su propia ventana.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-neutral-300">
          Toca cualquier proyecto de la sección de abajo para abrirlo aquí mismo, dentro del
          escritorio, o pulsa <strong className="font-semibold text-text">Abrir escritorio</strong>{' '}
          para verlo a pantalla completa en otra pestaña.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-full bg-accent px-[22px] py-[13px] font-display text-[15px] font-semibold text-bg transition hover:bg-white"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
