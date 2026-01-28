import { Barber } from "@/types/booking";

export default function BarberSelector({
  barbers,
  value,
  onChange,
  allowAny,
}: {
  barbers: Barber[];
  value: string;
  onChange: (id: string) => void;
  allowAny?: boolean;
}) {
  return (
    <section>
      <h2 className="text-lg font-medium">Barbeiro</h2>

      <div className="mt-3 flex flex-wrap gap-2">
        {allowAny && (
          <button
            type="button"
            onClick={() => onChange("")}
            className={[
              "rounded-full border px-4 py-2 text-sm transition",
              value === "" ? "border-black" : "border-black/10 hover:border-black/30",
            ].join(" ")}
          >
            Qualquer disponível
          </button>
        )}

        {barbers.map((b) => {
          const active = value === b.id;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => onChange(b.id)}
              className={[
                "rounded-full border px-4 py-2 text-sm transition",
                active ? "border-black" : "border-black/10 hover:border-black/30",
              ].join(" ")}
            >
              {b.name}
            </button>
          );
        })}
      </div>
    </section>
  );
}