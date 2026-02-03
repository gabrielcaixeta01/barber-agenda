import { Scissors } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-black/3 bg-white/50 py-12 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          
          {/* Logo / Branding */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white">
              <Scissors size={14} />
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-black">
              Barbearia
            </span>
          </div>

          {/* Links / Info */}
          <div className="flex flex-col items-center gap-1 md:items-end">
            <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-black/40">
              Sistema de Agendamento Online
            </p>
            <p className="text-[10px] font-light tracking-widest text-black/20 italic">
              Experience the art of grooming
            </p>
          </div>

        </div>

        {/* Bottom Line */}
        <div className="mt-8 flex flex-col items-center justify-between border-t border-black/3 pt-8 text-[9px] font-bold uppercase tracking-[0.25em] text-black/30 md:flex-row">
          <span>© {currentYear} todos os direitos reservados</span>
          <span className="mt-4 md:mt-0">Desenvolvido com precisão</span>
        </div>
      </div>
    </footer>
  );
}