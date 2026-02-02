import { Barber } from "@/types/booking";
import { Users } from "lucide-react";

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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {/* Opção "Qualquer um" com destaque visual diferente */}
      {allowAny && (
        <button
          type="button"
          onClick={() => onChange("")}
          className={`
            group flex flex-col items-center justify-center gap-3 rounded-2xl border-2 p-4 transition-all
            ${value === "" 
              ? "border-black bg-black/2 shadow-sm" 
              : "border-black/5 bg-white hover:border-black/20"
            }
          `}
        >
          <div className={`
            flex h-12 w-12 items-center justify-center rounded-full transition-colors
            ${value === "" ? "bg-black text-white" : "bg-black/5 text-black/40 group-hover:bg-black/10"}
          `}>
            <Users size={24} />
          </div>
          <div className="text-center">
            <p className={`text-sm font-semibold ${value === "" ? "text-black" : "text-black/60"}`}>
              Qualquer um
            </p>
            <p className="text-[10px] opacity-40 uppercase font-bold tracking-tighter">Melhor horário</p>
          </div>
        </button>
      )}

      {/* Lista de Barbeiros */}
      {barbers.map((b) => {
        const active = value === b.id;
        // Pega a inicial para o avatar caso não tenha foto
        const initial = b.name.charAt(0).toUpperCase();

        return (
          <button
            key={b.id}
            type="button"
            onClick={() => onChange(b.id)}
            className={`
              group flex flex-col items-center justify-center gap-3 rounded-2xl border-2 p-4 transition-all
              ${active 
                ? "border-black bg-black/2 shadow-sm" 
                : "border-black/5 bg-white hover:border-black/20"
              }
            `}
          >
            <div className={`
              relative flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold transition-all
              ${active 
                ? "bg-black text-white scale-110" 
                : "bg-black/5 text-black/40 group-hover:bg-black/10"
              }
            `}>
              {initial}
              
              {/* Indicador de Status Online ou Seleção sutil */}
              {active && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white ring-2 ring-black">
                   <div className="h-2 w-2 rounded-full bg-black" />
                </span>
              )}
            </div>

            <div className="text-center">
              <p className={`text-sm font-semibold ${active ? "text-black" : "text-black/60"}`}>
                {b.name}
              </p>
              <p className="text-[10px] opacity-40 uppercase font-bold tracking-tighter">Profissional</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}