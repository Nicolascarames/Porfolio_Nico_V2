import { useEffect, useState, type RefObject } from 'react';

interface UseInViewOptions {
  rootMargin?: string;
  threshold?: number;
  /** Deja de observar tras la primera entrada (útil para cargas perezosas). */
  once?: boolean;
}

/** true mientras el elemento está en pantalla (IntersectionObserver). */
export function useInView<T extends Element>(
  ref: RefObject<T>,
  { rootMargin = '0px', threshold = 0, once = false }: UseInViewOptions = {},
): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && once) io.disconnect();
      },
      { rootMargin, threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, threshold, once]);

  return inView;
}
