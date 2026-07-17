import type { Tech } from '../data/tech';
import { tech } from '../data/tech';

function TechIcon({ name, src }: Tech) {
  return (
    <div
      title={name}
      className="flex h-[62px] w-[62px] items-center justify-center rounded-2xl bg-text shadow-lg"
    >
      <img src={src} alt={name} loading="lazy" className="h-[60%] w-[60%] object-contain" />
    </div>
  );
}

export function TechMarquee() {
  return (
    <div className="mt-6 overflow-hidden [-webkit-mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)] [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
      <div className="marquee-track flex w-max animate-[marqR_42s_linear_infinite]">
        <div className="flex gap-[18px] pr-[18px]">
          {tech.map((t) => (
            <TechIcon key={t.name} {...t} />
          ))}
        </div>
        <div className="flex gap-[18px] pr-[18px]" aria-hidden="true">
          {tech.map((t) => (
            <TechIcon key={`${t.name}-dup`} {...t} />
          ))}
        </div>
      </div>
    </div>
  );
}
