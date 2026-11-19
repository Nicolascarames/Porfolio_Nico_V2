export function Hero() {
  return (
    <section id="top" className="flex flex-col px-5 pt-10 sm:px-[60px] sm:pt-20 min-[938px]:flex-row min-[938px]:items-end min-[938px]:justify-between min-[938px]:gap-12 min-[938px]:pt-0">
      <div className="max-w-[1000px] min-[938px]:shrink-0">
        <h1 className="text-balance font-display text-[clamp(42px,7.5vw,96px)] font-bold min-[938px]:text-[clamp(42px,min(7vw,8vh),96px)] leading-[0.98] tracking-tighter">
          Developer, design
          <br />
          and workflows
          <br />
          with AI
        </h1>
      </div>
      <p className="mt-7 max-w-[560px] text-pretty text-base leading-relaxed text-neutral-400 sm:mt-13 sm:text-lg min-[938px]:mt-0 min-[938px]:pb-2">
        QA Engineer · Automatización · Arquitectura. Construyo productos digitales de principio
        a fin y aseguro su calidad: automatización de pruebas, integraciones y CI/CD, con
        inteligencia artificial para lanzar más rápido y con mayor calidad.
      </p>
    </section>
  );
}
