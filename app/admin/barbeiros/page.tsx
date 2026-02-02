import { createSupabaseServer } from "@/lib/supabase/server";
import {
  createSchedule,
  updateSchedule,
  deleteSchedule,
  createBarber,
  updateBarber,
  deleteBarber,
} from "./actions";

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
  return String(t).slice(0, 5);
}

function dowLabel(v: number) {
  return DOW.find((d) => d.value === v)?.label ?? `Dia ${v}`;
}

export default async function AdminBarbersPage() {
  const supabase = await createSupabaseServer();

  const { data: barbersData, error: barbersError } = await supabase
    .from("barbers")
    .select("id, name, active")
    .order("name");

  if (barbersError) {
    return (
      <div className="min-h-screen p-6">
        <div className="rounded-2xl border border-black/10 bg-white p-6">
          <h1 className="text-xl font-semibold">Barbeiros</h1>
          <p className="mt-2 text-sm text-red-600">
            Erro ao carregar barbeiros: {barbersError.message}
          </p>
        </div>
      </div>
    );
  }

  const barbers = (barbersData ?? []) as BarberRow[];

  const { data: schedulesData, error: schedulesError } = await supabase
    .from("barber_schedules")
    .select("id, barber_id, day_of_week, start_time, end_time")
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true });

  if (schedulesError) {
    return (
      <div className="min-h-screen p-6">
        <div className="rounded-2xl border border-black/10 bg-white p-6">
          <h1 className="text-xl font-semibold">Barbeiros</h1>
          <p className="mt-2 text-sm text-red-600">
            Erro ao carregar horários: {schedulesError.message}
          </p>
        </div>
      </div>
    );
  }

  const schedules = (schedulesData ?? []) as ScheduleRow[];

  const byBarber = new Map<string, ScheduleRow[]>();
  for (const s of schedules) {
    if (!byBarber.has(s.barber_id)) byBarber.set(s.barber_id, []);
    byBarber.get(s.barber_id)!.push(s);
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-5xl space-y-8">
        <header>
          <h1 className="text-2xl font-semibold">Barbeiros</h1>
          <p className="mt-1 text-sm opacity-70">
            Crie, edite e remova barbeiros. Configure também os horários de trabalho de cada um.
          </p>
        </header>

        {/* Criar barbeiro */}
        <section className="rounded-2xl border border-black/10 bg-white p-6">
          <h2 className="text-lg font-medium">Adicionar barbeiro</h2>

          <form action={createBarber} className="mt-4 grid gap-3 sm:grid-cols-3">
            <input
              name="name"
              placeholder="Nome (ex: Lucas)"
              required
              className="h-11 rounded-xl border border-black/10 px-4 sm:col-span-2"
            />

            <label className="flex h-11 items-center gap-2 rounded-xl border border-black/10 px-4 text-sm">
              <input name="active" type="checkbox" defaultChecked className="h-4 w-4" />
              Ativo
            </label>

            <button className="h-11 rounded-xl bg-black px-5 text-sm font-medium text-white transition hover:opacity-90 sm:col-span-3 sm:justify-self-start">
              Criar
            </button>
          </form>

          <p className="mt-3 text-xs opacity-60">
            Dica: se você não quiser perder histórico, prefira marcar como “inativo” ao invés de excluir.
          </p>
        </section>

        {/* Lista de barbeiros */}
        {barbers.length === 0 ? (
          <div className="rounded-2xl border border-black/10 bg-white p-10 text-center text-sm opacity-60">
            Nenhum barbeiro cadastrado.
          </div>
        ) : (
          <div className="space-y-4">
            {barbers.map((b) => {
              const list = byBarber.get(b.id) ?? [];

              return (
                <section key={b.id} className="rounded-2xl border border-black/10 bg-white">
                  <div className="border-b border-black/10 px-6 py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h2 className="truncate text-lg font-medium">{b.name}</h2>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-xs ${
                              b.active
                                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700"
                                : "border-black/10 bg-black/5 text-black/70"
                            }`}
                          >
                            {b.active ? "Ativo" : "Inativo"}
                          </span>
                        </div>
                        <div className="mt-1 text-xs opacity-60">ID: {b.id}</div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {/* Editar barbeiro */}
                        <details className="group">
                          <summary className="cursor-pointer list-none rounded-xl border border-black/10 px-4 py-2 text-sm transition hover:border-black/30">
                            Editar barbeiro
                          </summary>

                          <div className="mt-2 rounded-2xl border border-black/10 bg-white p-4">
                            <form action={updateBarber} className="grid gap-3 sm:grid-cols-3">
                              <input type="hidden" name="id" value={b.id} />

                              <input
                                name="name"
                                defaultValue={b.name}
                                required
                                className="h-11 rounded-xl border border-black/10 px-4 sm:col-span-2"
                              />

                              <label className="flex h-11 items-center gap-2 rounded-xl border border-black/10 px-4 text-sm">
                                <input
                                  name="active"
                                  type="checkbox"
                                  defaultChecked={b.active}
                                  className="h-4 w-4"
                                />
                                Ativo
                              </label>

                              <button className="h-11 rounded-xl bg-black px-5 text-sm font-medium text-white transition hover:opacity-90 sm:col-span-3 sm:justify-self-start">
                                Salvar
                              </button>
                            </form>
                          </div>
                        </details>

                        {/* Excluir barbeiro */}
                        <form action={deleteBarber}>
                          <input type="hidden" name="id" value={b.id} />
                          <button
                            className="rounded-xl border border-black/10 px-4 py-2 text-sm text-red-600 transition hover:border-red-600/40"
                            type="submit"
                          >
                            Excluir
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>

                  {/* Conteúdo: horários */}
                  <div className="px-6 py-5 space-y-6">
                    {/* Adicionar horário */}
                    <div className="rounded-2xl border border-black/10 p-4">
                      <div className="text-sm font-medium">Adicionar horário</div>
                      <p className="mt-1 text-xs opacity-60">
                        Você pode criar múltiplos intervalos no mesmo dia (ex.: manhã e tarde).
                      </p>

                      <form
                        action={createSchedule}
                        className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
                      >
                        <input type="hidden" name="barber_id" value={b.id} />

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
                    </div>

                    {/* Lista de horários */}
                    <div>
                      <div className="text-sm font-medium">Horários</div>

                      {list.length === 0 ? (
                        <div className="mt-4 rounded-2xl border border-black/10 p-6 text-center text-sm opacity-60">
                          Nenhum horário definido para este barbeiro.
                        </div>
                      ) : (
                        <ul className="mt-4 divide-y divide-black/10 rounded-2xl border border-black/10">
                          {list.map((s) => (
                            <li key={s.id} className="p-4">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
                                  <div className="text-sm font-medium">
                                    {dowLabel(s.day_of_week)}{" "}
                                    <span className="font-normal opacity-70">
                                      • {asHHMM(s.start_time)}–{asHHMM(s.end_time)}
                                    </span>
                                  </div>
                                  <div className="mt-1 text-xs opacity-60">ID: {s.id}</div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  {/* Editar horário */}
                                  <details className="group">
                                    <summary className="cursor-pointer list-none rounded-xl border border-black/10 px-4 py-2 text-sm transition hover:border-black/30">
                                      Editar horário
                                    </summary>

                                    <div className="mt-2 rounded-2xl border border-black/10 bg-white p-4">
                                      <form
                                        action={updateSchedule}
                                        className="grid gap-3 sm:grid-cols-4"
                                      >
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

                                  {/* Excluir horário */}
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
                    </div>

                    {!b.active && (
                      <div className="rounded-2xl border border-black/10 bg-black/2 p-4 text-sm opacity-80">
                        Este barbeiro está <span className="font-medium">inativo</span>.
                        Você pode manter os horários, mas ele não deve aparecer para agendamento.
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}