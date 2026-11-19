import type { ButtonHTMLAttributes, ReactNode } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean;
  variant?: "primary" | "ghost";
}

// Private-area button (reality404 look): primary = r4-btn, ghost = r4-btn-ghost.
export function R4Button({ children, loading = false, variant = "primary", className = "", disabled, ...rest }: Props) {
  const base = variant === "primary" ? "r4-btn" : "r4-btn-ghost disabled:cursor-default disabled:opacity-50";
  return (
    <button {...rest} disabled={disabled || loading} className={`${base} ${className}`}>
      {loading && (
        <span className="spin inline-block h-4 w-4 rounded-full border-2 border-on-frost/30 border-t-on-frost" />
      )}
      {children}
    </button>
  );
}
