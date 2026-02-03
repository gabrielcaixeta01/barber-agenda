import Link from "next/link";
import { MapPin, Clock, ShieldCheck, ArrowRight, Scissors, CalendarCheck2, Store } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#FAFAFA] text-black">
      {/* HERO - Mais espaçamento e tipografia refinada */}
      <section className="mx-auto max-w-5xl px-6 pt-28 pb-20 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-1.5 text-xs font-medium tracking-wide shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          AGENDAMENTO ONLINE
        </span>

        <h1 className="mt-8 text-5xl font-bold tracking-tight sm:text-7xl">
          Corte marcado, <br />
          <span className="text-black/40">sem complicação.</span>
        </h1>

        <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-black/60">
          Escolha o serviço, selecione um horário disponível e apareça na
          barbearia. Simples, rápido e sem cadastro.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4 px-4">
          <Link
            href="/agendar"
            className="group flex items-center justify-center gap-2 rounded-full bg-black px-10 py-4 text-white transition-all hover:scale-[1.02] active:scale-95"
          >
            Agendar agora
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>

          <a
            href="#info"
            className="rounded-full border border-black/10 bg-white px-10 py-4 font-medium transition hover:bg-black/5"
          >
            Ver informações
          </a>
        </div>
      </section>

      {/* COMO FUNCIONA - Visual mais leve, sem bordas em volta de tudo */}
      <section className="mx-auto max-w-5xl px-6 pb-32">
        <div className="grid gap-12 md:gap-8 sm:grid-cols-3">
          <Step
            Icon={Scissors}
            title="Escolha o serviço"
            text="Corte, barba ou combo. Duração e preço claros."
          />
          <Step
            Icon={CalendarCheck2}
            title="Escolha o horário"
            text="Apenas horários realmente disponíveis em tempo real."
          />
          <Step
            Icon={Store}
            title="Apareça na unidade"
            text="Pagamento presencial, rápido e sem burocracia."
          />
        </div>
      </section>

      {/* INFORMAÇÕES - Cards com fundo branco e ícones para facilitar leitura */}
      <section id="info" className="bg-black/2 border-y border-black/5 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-6 md:grid-cols-3">
            <InfoCard
              Icon={MapPin}
              title="Endereço"
              text="Rua 123,  – Brasília/DF"
              action={
                <a
                  href="https://www.google.com/maps/place/Bras%C3%ADlia+-+Plano+Piloto,+Bras%C3%ADlia+-+DF/@-15.7213681,-48.0197586,12z/data=!3m1!4b1!4m6!3m5!1s0x935a3d18df9ae275:0x738470e469754a24!8m2!3d-15.7975154!4d-47.8918874!16zL20vMDFoeV8?entry=ttu&g_ep=EgoyMDI2MDIwMS4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-bold uppercase tracking-wider underline underline-offset-4"
                >
                  Abrir no Maps
                </a>
              }
            />

            <InfoCard
              Icon={Clock}
              title="Funcionamento"
              text={
                <span className="block leading-relaxed">
                  Seg a Sex: 9h às 19h<br />
                  Sábado: 9h às 16h
                </span>
              }
            />

            <InfoCard
              Icon={ShieldCheck}
              title="Política"
              text="Tolerância de 10 minutos. Cancelamentos até 2h antes."
            />
          </div>
        </div>
      </section>

      {/* CTA FINAL - Design em "Box" para fechar a página */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <div className="rounded-4xl bg-black p-8 md:p-16 text-center text-white overflow-hidden relative">
            <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-medium">Garante seu horário hoje.</h2>
                <p className="mx-auto mt-4 max-w-md font-light opacity-60">
                    Leva menos de 1 minuto e você não precisa criar conta.
                </p>
                <div className="mt-10">
                    <Link
                    href="/agendar"
                    className="inline-block rounded-full bg-white px-10 py-4 text-black font-light transition hover:bg-white/90"
                    >
                    Agendar agora
                    </Link>
                </div>
            </div>
            {/* Elemento decorativo sutil de fundo */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        </div>
      </section>
    </main>
  );
}

function Step({ Icon, title, text }: { Icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/5 text-black mb-6">
        <Icon size={24} strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-medium tracking-tight">{title}</h3>
      <p className="mt-3 text-black/50 font-light leading-relaxed">{text}</p>
    </div>
  );
}

function InfoCard({ Icon, title, text, action }: { Icon: LucideIcon; title: string; text: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-white border border-black/5 p-8 shadow-sm transition-hover hover:shadow-md">
      <Icon size={22} className="text-black/40" strokeWidth={2} />
      <h3 className="mt-6 text-sm font-medium uppercase tracking-widest text-black/40">{title}</h3>
      <div className="mt-2 text-lg font-light text-black/80">{text}</div>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}