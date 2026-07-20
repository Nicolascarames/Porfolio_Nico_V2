import type { ButtonHTMLAttributes, ReactNode } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean;
}

export function PrimaryButton({ children, loading = false, className = "", disabled, ...rest }: Props) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`flex h-14 w-full items-center justify-center gap-2.5 rounded-xl bg-[var(--color-btn-primary-bg)] text-base font-semibold text-[var(--color-btn-primary-text)] transition-transform hover:bg-white/90 active:scale-[0.98] disabled:opacity-80 ${className}`}
    >
      {loading && (
        <span className="spin inline-block h-4 w-4 rounded-full border-2 border-black/30 border-t-black" />
      )}
      {children}
    </button>
  );
}
