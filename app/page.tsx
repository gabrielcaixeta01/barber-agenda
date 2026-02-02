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
          Escolha o serviço, selecione um horário disponível e apareça na
          barbearia. Simples, rápido e sem cadastro.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/agendar"
            className="rounded-xl bg-black px-8 py-4 text-white transition hover:opacity-90"
          >
            Agendar agora
          </Link>

          <a
            href="#info"
            className="rounded-xl border border-black/10 px-8 py-4 transition hover:bg-black/5"
          >
            Ver informações
          </a>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-6 sm:grid-cols-3">
          <Step
            number="01"
            title="Escolha o serviço"
            text="Corte, barba ou combo. Duração e preço claros."
          />
          <Step
            number="02"
            title="Escolha o horário"
            text="Apenas horários realmente disponíveis."
          />
          <Step
            number="03"
            title="Apareça na barbearia"
            text="Pagamento presencial, rápido e sem burocracia."
          />
        </div>
      </section>

      {/* INFORMAÇÕES DA BARBEARIA */}
      <section
        id="info"
        className="mx-auto max-w-5xl px-6 pb-24"
      >
        <div className="grid gap-8 sm:grid-cols-3">
          <InfoCard
            title="Endereço"
            text={
              <>
                Rua Exemplo, 123<br />
                Centro – Brasília/DF
              </>
            }
            action={
              <a
                href="https://maps.google.com"
                target="_blank"
                className="text-sm font-medium underline"
              >
                Como chegar
              </a>
            }
          />

          <InfoCard
            title="Horário de funcionamento"
            text={
              <>
                Seg a Sex: 9h às 19h<br />
                Sábado: 9h às 16h
              </>
            }
          />

          <InfoCard
            title="Política"
            text="Tolerância de 10 minutos de atraso. Cancelamentos até 2h antes."
          />
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="border-t border-black/5">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center">
          <h2 className="text-2xl font-semibold">
            Pronto para marcar seu horário?
          </h2>

          <p className="mx-auto mt-4 max-w-md text-sm opacity-80">
            Leva menos de 1 minuto e você já sai com o corte garantido.
          </p>

          <div className="mt-8">
            <Link
              href="/agendar"
              className="rounded-xl bg-black px-8 py-4 text-white transition hover:opacity-90"
            >
              Agendar agora
            </Link>
          </div>
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

function InfoCard({
  title,
  text,
  action,
}: {
  title: string;
  text: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-black/10 p-6">
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="mt-3 text-sm opacity-80">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}