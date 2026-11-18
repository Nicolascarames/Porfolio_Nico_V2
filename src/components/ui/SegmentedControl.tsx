interface SegmentedControlProps<T extends string> {
  label: string; // nombre accesible del grupo
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

/** Control segmentado de vidrio (`.r4-seg`, port del `.seg` de las previews v2). */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className="r4-seg r4-glass" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
