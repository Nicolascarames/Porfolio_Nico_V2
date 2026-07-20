import type { InputHTMLAttributes, ReactNode } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  trailing?: ReactNode;
}

export function InputGroup({ label, trailing, className = "", ...inputProps }: Props) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-white">{label}</span>
      <div className="relative">
        <input
          {...inputProps}
          className={`h-[52px] w-full rounded-xl border border-transparent bg-brand-gray px-4 text-[15px] text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 ${
            trailing ? "pr-12" : ""
          } ${className}`}
        />
        {trailing && <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{trailing}</div>}
      </div>
    </label>
  );
}
