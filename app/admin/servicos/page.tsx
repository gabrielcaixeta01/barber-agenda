import { createSupabaseServer } from "@/lib/supabase/server";
import { createService, updateService, deleteService } from "./actions";

type ServiceRow = {
  id: string;
  name: string;
  duration_minutes: number;
  price_cents: number;
  created_at: string;
};

function formatBRLFromCents(cents: number) {
  const v = (cents ?? 0) / 100;
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function centsToBRInput(cents: number) {
  const v = (cents ?? 0) / 100;
  // "35,00"
  return v.toFixed(2).replace(".", ",");
}

export default async function AdminServicesPage() {
  const supabase = await createSupabaseServer();

  const { data, error } = await supabase
    .from("services")
    .select("id, name, duration_minutes, price_cents, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <div className="rounded-2xl border border-black/10 bg-white p-6">
          <h1 className="text-xl font-semibold">Serviços</h1>
          <p className="mt-2 text-sm text-red-600">
            Erro ao carregar serviços: {error.message}
          </p>
        </div>
      </div>
    );
  }

  const services = (data ?? []) as ServiceRow[];

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-4xl space-y-8">
        <header>
          <h1 className="text-2xl font-semibold">Serviços</h1>
          <p className="mt-1 text-sm opacity-70">
            Crie, edite e remova os serviços disponíveis para agendamento.
          </p>
        </header>

        {/* Create */}
        <section className="rounded-2xl border border-black/10 bg-white p-6">
          <h2 className="text-lg font-medium">Adicionar serviço</h2>

          <form action={createService} className="mt-4 grid gap-3 sm:grid-cols-4">
            <input
              name="name"
              placeholder="Nome do serviço (ex: Corte)"
              required
              className="h-11 rounded-xl border border-black/10 px-4 sm:col-span-2"
            />

            <input
              name="duration_minutes"
              type="number"
              min={5}
              step={5}
              defaultValue={30}
              required
              className="h-11 rounded-xl border border-black/10 px-4"
              placeholder="Duração (min)"
            />

            <input
              name="price"
              inputMode="decimal"
              placeholder="Preço (ex: 35,00)"
              required
              className="h-11 rounded-xl border border-black/10 px-4"
            />

            <button className="h-11 rounded-xl bg-black px-5 text-sm font-medium text-white transition hover:opacity-90 sm:col-span-4 sm:justify-self-start">
              Criar
            </button>
          </form>

          <p className="mt-3 text-xs opacity-60">
            Observação: no MVP, a duração padrão é 30 minutos, mas você pode ajustar por serviço.
          </p>
        </section>

        {/* List */}
        <section className="rounded-2xl border border-black/10 bg-white">
          <div className="flex items-center justify-between border-b border-black/10 px-6 py-4">
            <h2 className="text-lg font-medium">Lista</h2>
            <div className="text-sm opacity-70">Total: {services.length}</div>
          </div>

          {services.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm opacity-60">
              Nenhum serviço cadastrado.
            </div>
          ) : (
            <ul className="divide-y divide-black/10">
              {services.map((s) => (
                <li key={s.id} className="px-6 py-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">{s.name}</span>
                        <span className="rounded-full border border-black/10 bg-black/5 px-2 py-0.5 text-xs text-black/80">
                          {s.duration_minutes} min
                        </span>
                        <span className="rounded-full border border-black/10 bg-black/5 px-2 py-0.5 text-xs text-black/80">
                          {formatBRLFromCents(s.price_cents)}
                        </span>
                      </div>
                      <div className="mt-1 text-xs opacity-60">ID: {s.id}</div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {/* Edit */}
                      <details className="group">
                        <summary className="cursor-pointer list-none rounded-xl border border-black/10 px-4 py-2 text-sm transition hover:border-black/30">
                          Editar
                        </summary>

                        <div className="mt-2 rounded-2xl border border-black/10 bg-white p-4">
                          <form action={updateService} className="grid gap-3 sm:grid-cols-4">
                            <input type="hidden" name="id" value={s.id} />

                            <input
                              name="name"
                              defaultValue={s.name}
                              required
                              className="h-11 rounded-xl border border-black/10 px-4 sm:col-span-2"
                            />

                            <input
                              name="duration_minutes"
                              type="number"
                              min={5}
                              step={5}
                              defaultValue={s.duration_minutes}
                              required
                              className="h-11 rounded-xl border border-black/10 px-4"
                            />

                            <input
                              name="price"
                              inputMode="decimal"
                              defaultValue={centsToBRInput(s.price_cents)}
                              required
                              className="h-11 rounded-xl border border-black/10 px-4"
                            />

                            <button className="h-11 rounded-xl bg-black px-5 text-sm font-medium text-white transition hover:opacity-90 sm:col-span-4 sm:justify-self-start">
                              Salvar
                            </button>
                          </form>
                        </div>
                      </details>

                      {/* Delete */}
                      <form action={deleteService}>
                        <input type="hidden" name="id" value={s.id} />
                        <button
                          className="rounded-xl border border-black/10 px-4 py-2 text-sm text-red-600 transition hover:border-red-600/40"
                          type="submit"
                        >
                          Excluir
                        </button>
                      </form>
                    </div>
                  </div>

                  <p className="mt-3 text-xs opacity-60">
                    Atenção: excluir um serviço pode falhar se ele já estiver vinculado a agendamentos.
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}