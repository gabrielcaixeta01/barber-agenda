import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* HERO */}
      <section className="mx-auto max-w-5xl px-6 pt-24 pb-20 text-center">
        <span className="inline-block rounded-full border border-black/10 px-4 py-1 text-sm">
          Agendamento online
        </span>

        <h1 className="mt-6 text-4xl font-semibold sm:text-5xl">
          Corte marcado, <br className="hidden sm:block" />
          sem complicação
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base opacity-80">
          Escolha o horário disponível e apareça na barbearia.
          Simples, rápido e sem cadastro.
        </p>

        <div className="mt-10 flex justify-center">
          <Link
            href="/agendar"
            className="rounded-xl bg-black px-8 py-4 text-white transition hover:opacity-90"
          >
            Agendar agora
          </Link>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-6 sm:grid-cols-3">
          <Step
            number="01"
            title="Escolha o serviço"
            text="Selecione o tipo de corte ou barba."
          />
          <Step
            number="02"
            title="Escolha o horário"
            text="Veja os horários disponíveis no dia."
          />
          <Step
            number="03"
            title="Apareça na barbearia"
            text="Pagamento presencial, sem dor de cabeça."
          />
        </div>
      </section>
    </main>
  );
}

function Step({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-black/10 p-6">
      <div className="text-sm opacity-60">{number}</div>
      <h3 className="mt-2 text-lg font-medium">{title}</h3>
      <p className="mt-2 text-sm opacity-80">{text}</p>
    </div>
  );
}