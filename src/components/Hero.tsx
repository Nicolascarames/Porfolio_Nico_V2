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
      <p className="mt-7 max-w-[560px] text-pretty text-base leading-relaxed text-neutral-400 sm:mt-13 sm:text-lg">
        Construyo productos digitales de principio a fin: interfaces limpias, código
        mantenible y experiencias potenciadas por inteligencia artificial. Combino desarrollo,
        QA y automatización de flujos de trabajo para lanzar más rápido y con mayor calidad.
      </p>
    </section>
  );
}
