import { createSupabaseServer } from "@/lib/supabase/server";
import { createSchedule, updateSchedule, deleteSchedule, setBarberFilter } from "./actions";

type BarberRow = {
  id: string;
  name: string;
  active: boolean;
};

type ScheduleRow = {
  id: string;
  barber_id: string;
  day_of_week: number;
  start_time: string; // "HH:MM:SS" ou "HH:MM"
  end_time: string;
  barber: { id: string; name: string } | null;
};

const DOW: Array<{ value: number; label: string }> = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terça" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sábado" },
];

function asHHMM(t: string) {
  // supabase pode devolver "HH:MM:SS"
  return String(t).slice(0, 5);
}

export default async function AdminSchedulesPage({
  searchParams,
}: {
  searchParams: Promise<{ barber?: string }>;
}) {
  const sp = await searchParams;
  const barberFilter = sp.barber?.trim() || "";

  const supabase = await createSupabaseServer();

  const { data: barbersData, error: barbersError } = await supabase
    .from("barbers")
    .select("id, name, active")
    .order("name");

  if (barbersError) {
    return (
      <div className="min-h-screen p-6">
        <div className="rounded-2xl border border-black/10 bg-white p-6">
          <h1 className="text-xl font-semibold">Horários</h1>
          <p className="mt-2 text-sm text-red-600">
            Erro ao carregar barbeiros: {barbersError.message}
          </p>
        </div>
      </div>
    );
  }

  const barbers = (barbersData ?? []) as BarberRow[];

  let schedulesQuery = supabase
    .from("barber_schedules")
    .select("id, barber_id, day_of_week, start_time, end_time, barber:barbers(id, name)")
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true });

  if (barberFilter) schedulesQuery = schedulesQuery.eq("barber_id", barberFilter);

  const { data: schedulesData, error: schedulesError } = await schedulesQuery;

  if (schedulesError) {
    return (
      <div className="min-h-screen p-6">
        <div className="rounded-2xl border border-black/10 bg-white p-6">
          <h1 className="text-xl font-semibold">Horários</h1>
          <p className="mt-2 text-sm text-red-600">
            Erro ao carregar horários: {schedulesError.message}
          </p>
        </div>
      </div>
    );
  }

  const schedules = (schedulesData ?? []) as unknown as ScheduleRow[];

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Horários</h1>
            <p className="mt-1 text-sm opacity-70">
              Defina os dias da semana e intervalos de atendimento de cada barbeiro.
            </p>
          </div>
        </header>

        {/* Criar */}
        <section className="rounded-2xl border border-black/10 bg-white p-6">
          <h2 className="text-lg font-medium">Adicionar horário</h2>

          <form action={createSchedule} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <select
              name="barber_id"
              required
              defaultValue={barberFilter || ""}
              className="h-11 rounded-xl border border-black/10 bg-white px-3"
            >
              <option value="" disabled>
                Selecione o barbeiro
              </option>
              {barbers
                .filter((b) => b.active)
                .map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
            </select>

            <select
              name="day_of_week"
              required
              defaultValue="1"
              className="h-11 rounded-xl border border-black/10 bg-white px-3"
            >
              {DOW.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>

            <input
              name="start_time"
              type="time"
              required
              defaultValue="09:00"
              className="h-11 rounded-xl border border-black/10 px-4"
            />

            <input
              name="end_time"
              type="time"
              required
              defaultValue="18:00"
              className="h-11 rounded-xl border border-black/10 px-4"
            />

            <button className="h-11 rounded-xl bg-black px-5 text-sm font-medium text-white transition hover:opacity-90">
              Criar
            </button>
          </form>

          <p className="mt-3 text-xs opacity-60">
            Observação: este MVP permite múltiplos intervalos no mesmo dia para o mesmo barbeiro (ex.: manhã e tarde).
          </p>
        </section>

        {/* Filtro */}
        <section className="rounded-2xl border border-black/10 bg-white p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-medium">Filtro</h2>
              <p className="mt-1 text-sm opacity-70">
                Filtre a lista de horários por barbeiro.
              </p>
            </div>

            <form action={setBarberFilter} className="flex w-full gap-2 sm:w-auto">
              <select
                name="barber_id"
                defaultValue={barberFilter}
                className="h-11 flex-1 rounded-xl border border-black/10 bg-white px-3 sm:w-72"
              >
                <option value="">Todos os barbeiros</option>
                {barbers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} {b.active ? "" : "(inativo)"}
                  </option>
                ))}
              </select>

              <button className="h-11 rounded-xl border border-black/10 px-4 text-sm transition hover:border-black/30">
                Aplicar
              </button>
            </form>
          </div>
        </section>

        {/* Lista */}
        <section className="rounded-2xl border border-black/10 bg-white">
          <div className="flex items-center justify-between border-b border-black/10 px-6 py-4">
            <h2 className="text-lg font-medium">Lista</h2>
            <div className="text-sm opacity-70">Total: {schedules.length}</div>
          </div>

          {schedules.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm opacity-60">
              Nenhum horário cadastrado.
            </div>
          ) : (
            <ul className="divide-y divide-black/10">
              {schedules.map((s) => (
                <li key={s.id} className="px-6 py-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-medium">
                          {s.barber?.name ?? "Barbeiro"}
                        </span>
                        <span className="text-sm opacity-70">
                          {DOW.find((d) => d.value === s.day_of_week)?.label ?? `Dia ${s.day_of_week}`}
                          {" • "}
                          {asHHMM(s.start_time)}–{asHHMM(s.end_time)}
                        </span>
                      </div>
                      <div className="mt-1 text-xs opacity-60">ID: {s.id}</div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {/* Editar */}
                      <details className="group">
                        <summary className="cursor-pointer list-none rounded-xl border border-black/10 px-4 py-2 text-sm transition hover:border-black/30">
                          Editar
                        </summary>

                        <div className="mt-2 rounded-2xl border border-black/10 bg-white p-4">
                          <form action={updateSchedule} className="grid gap-3 sm:grid-cols-4">
                            <input type="hidden" name="id" value={s.id} />

                            <select
                              name="day_of_week"
                              required
                              defaultValue={String(s.day_of_week)}
                              className="h-11 rounded-xl border border-black/10 bg-white px-3"
                            >
                              {DOW.map((d) => (
                                <option key={d.value} value={d.value}>
                                  {d.label}
                                </option>
                              ))}
                            </select>

                            <input
                              name="start_time"
                              type="time"
                              required
                              defaultValue={asHHMM(s.start_time)}
                              className="h-11 rounded-xl border border-black/10 px-4"
                            />

                            <input
                              name="end_time"
                              type="time"
                              required
                              defaultValue={asHHMM(s.end_time)}
                              className="h-11 rounded-xl border border-black/10 px-4"
                            />

                            <button className="h-11 rounded-xl bg-black px-5 text-sm font-medium text-white transition hover:opacity-90">
                              Salvar
                            </button>
                          </form>
                        </div>
                      </details>

                      {/* Excluir */}
                      <form action={deleteSchedule}>
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
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}