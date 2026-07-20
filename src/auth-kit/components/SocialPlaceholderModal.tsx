import { Wrench, X } from "lucide-react";

interface Props {
  message: string;
  onClose: () => void;
}

export function SocialPlaceholderModal({ message, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-sm rounded-2xl border border-white/10 bg-[#0f0f11] p-8 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-white/5">
          <Wrench className="h-7 w-7 text-white/50" />
        </div>
        <h3 className="text-xl font-semibold">Temporarily unavailable</h3>
        <p className="mt-2.5 text-sm leading-relaxed text-white/50">{message}</p>
        <button
          onClick={onClose}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white/8 py-3 text-sm font-medium text-white transition-colors hover:bg-white/12"
        >
          <X className="h-4 w-4" />
          Got it
        </button>
      </div>
    </div>
  );
}
