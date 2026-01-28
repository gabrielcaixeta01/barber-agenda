import { Service } from "@/types/booking";

export default function ServiceSelector({
  services,
  value,
  onChange,
}: {
  services: Service[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <section>
      <h2 className="text-lg font-medium">Serviço</h2>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {services.map((s) => {
          const active = value === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onChange(s.id)}
              className={[
                "rounded-xl border px-4 py-3 text-left transition",
                active ? "border-black" : "border-black/10 hover:border-black/30",
              ].join(" ")}
            >
              <div className="font-medium">{s.name}</div>
              <div className="text-sm opacity-70">{s.duration_minutes} min</div>
            </button>
          );
        })}
      </div>
    </section>
  );
}