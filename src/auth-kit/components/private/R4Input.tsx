import type { InputHTMLAttributes, ReactNode } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  trailing?: ReactNode;
}

// Private-area text field (reality404 look). Same props as the login's
// InputGroup, which stays purple and untouched.
export function R4Input({ label, trailing, className = "", ...inputProps }: Props) {
  return (
    <label className="block">
      <span className="r4-eyebrow mb-2 block">{label}</span>
      <div className="relative">
        <input
          {...inputProps}
          className={`h-12 w-full rounded-r4-md border border-glass-edge bg-glass px-4 text-[15px] text-ink placeholder:text-ink-faint focus:border-frost-100 focus:outline-none focus:ring-2 focus:ring-focus-ring ${
            trailing ? "pr-12" : ""
          } ${className}`}
        />
        {trailing && <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{trailing}</div>}
      </div>
    </label>
  );
}
