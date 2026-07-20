import type { ReactNode } from "react";

interface Props {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}

export function SocialButton({ icon, label, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[52px] items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-black text-[15px] font-medium text-white transition-colors hover:bg-white/5"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
