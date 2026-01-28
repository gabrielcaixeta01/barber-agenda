export default function TimeSlots({
  slots,
  value,
  onChange,
  disabled,
}: {
  slots: string[];
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <section>
      <div className="flex items-end justify-between">
        <h2 className="text-lg font-medium">Horário</h2>
        {disabled && <span className="text-xs opacity-60">Escolha um serviço primeiro</span>}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
        {slots.map((t) => {
          const active = value === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => onChange(t)}
              disabled={disabled}
              className={[
                "rounded-xl border px-3 py-2 text-sm transition",
                disabled
                  ? "cursor-not-allowed opacity-40"
                  : active
                  ? "border-black"
                  : "border-black/10 hover:border-black/30",
              ].join(" ")}
            >
              {t}
            </button>
          );
        })}
      </div>
    </section>
  );
}