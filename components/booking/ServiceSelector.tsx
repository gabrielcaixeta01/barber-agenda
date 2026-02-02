import { Service } from "@/types/booking";
import { Check } from "lucide-react";

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
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {services.map((s) => {
        const active = value === s.id;
        
        // Formatação de preço amigável
        const price = s.price_cents 
          ? `R$ ${(s.price_cents / 100).toFixed(2).replace(".", ",")}` 
          : "Sob consulta";

        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onChange(s.id)}
            className={`
              group relative flex flex-col justify-between rounded-2xl border-2 p-4 text-left transition-all duration-200
              ${active 
                ? "border-black bg-black/2 shadow-md shadow-black/5" 
                : "border-black/5 bg-white hover:border-black/20 hover:bg-gray-50"
              }
            `}
          >
            {/* Indicador de seleção (Check) */}
            <div className={`
              absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full transition-all
              ${active ? "bg-black text-white scale-100" : "bg-transparent scale-0"}
            `}>
              <Check size={12} strokeWidth={3} />
            </div>

            <div>
              <h3 className={`font-semibold tracking-tight transition-colors ${active ? "text-black" : "text-black/70 group-hover:text-black"}`}>
                {s.name}
              </h3>
              <p className="mt-1 text-xs font-medium opacity-40 uppercase tracking-wider">
                {s.duration_minutes} min
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className={`text-sm font-bold ${active ? "text-black" : "text-black/60"}`}>
                {price}
              </span>
              
              {!active && (
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 transition-opacity group-hover:opacity-100">
                  Selecionar
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}