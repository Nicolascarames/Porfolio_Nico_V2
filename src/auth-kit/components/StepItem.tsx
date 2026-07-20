interface Props {
  number: number | string;
  text: string;
  active?: boolean;
}

export function StepItem({ number, text, active = false }: Props) {
  return (
    <div
      className={`flex items-center gap-3.5 rounded-2xl px-[18px] py-4 ${
        active ? "border border-white bg-white text-black" : "bg-brand-gray text-white"
      }`}
    >
      <span
        className={`grid h-7 w-7 place-items-center rounded-full text-[13px] font-semibold ${
          active ? "bg-black text-white" : "bg-white/10 text-white/40"
        }`}
      >
        {number}
      </span>
      <span className="text-[15px] font-medium">{text}</span>
    </div>
  );
}
