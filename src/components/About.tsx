import nicoImg from '../assets/profile/nico.png?w=600&format=webp';

export function About() {
  return (
    <section
      id="sobre-mi"
      className="flex justify-center border-t border-white/5 px-5 py-16 sm:px-[60px] sm:py-[120px]"
    >
      <div className="flex w-full max-w-[940px] flex-wrap items-center gap-8 rounded-[28px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md sm:gap-12 sm:p-10">
        <div className="relative w-[clamp(220px,26vw,300px)] rounded-xl bg-text p-3 pb-10 shadow-2xl">
          <div className="aspect-[4/5] overflow-hidden rounded-md bg-neutral-300">
            <img src={nicoImg} alt="Nico" className="h-full w-full object-cover" />
          </div>
          <span className="absolute bottom-3 left-5 font-display text-[15px] font-semibold text-neutral-900">
            Nico
          </span>
        </div>
        <div className="min-w-[260px] flex-1">
          <div className="mb-4 inline-flex items-center gap-2 text-[13px] text-neutral-400">
            <span className="inline-block h-[9px] w-[9px] rounded-full bg-green-400" />
            Disponible para proyectos
          </div>
          <h2 className="mb-4 font-display text-[clamp(26px,3.4vw,40px)] font-semibold tracking-tighter">
            Sobre mí
          </h2>
          <p className="mb-3.5 text-pretty text-[15px] leading-relaxed text-neutral-300 sm:text-lg">
            Soy <strong className="font-semibold text-text">developer</strong> con foco en
            calidad. Trabajo el ciclo completo: escribo código, hago{' '}
            <strong className="font-semibold text-text">QA</strong> y aseguro que lo que se
            lanza funciona de verdad.
          </p>
          <p className="text-pretty text-[15px] leading-relaxed text-neutral-300 sm:text-lg">
            Diseño y automatizo <strong className="font-semibold text-text">workflows</strong> y
            aprovecho la <strong className="font-semibold text-text">IA</strong> para acelerar
            cada etapa del desarrollo sin perder control ni criterio.
          </p>
        </div>
      </div>
    </section>
  );
}
