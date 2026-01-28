import { createSupabaseServer } from "@/lib/supabase/server";
import {
  cancelAppointment,
  reactivateAppointment,
  updateAppointment,
  deleteAppointment,
  setAppointmentsFilter,
} from "./actions";

type BarberRow = { id: string; name: string; active: boolean };
type ServiceRow = { id: string; name: string; duration_minutes: number };

type AppointmentRow = {
  id: string;
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string; // HH:MM:SS
  status: "active" | "cancelled";
  client_name: string;
  client_phone: string;
  barber: { id: string; name: string } | null;
  service: { id: string; name: string } | null;
  barber_id: string | null;
  service_id: string;
};

function asHHMM(t: string) {
  return String(t).slice(0, 5);
}

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default async function AdminAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const dateFilter = (sp.date ?? "").trim();
  const statusFilter = (sp.status ?? "").trim(); // active | cancelled | ""

  const supabase = await createSupabaseServer();

  const [{ data: barbersData, error: barbersError }, { data: servicesData, error: servicesError }] =
    await Promise.all([
      supabase.from("barbers").select("id, name, active").order("name"),
      supabase.from("services").select("id, name, duration_minutes").order("name"),
    ]);

  if (barbersError) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-6">
        <h1 className="text-xl font-semibold">Agendamentos</h1>
        <p className="mt-2 text-sm text-red-600">Erro ao carregar barbeiros: {barbersError.message}</p>
      </div>
    );
  }

  if (servicesError) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-6">
        <h1 className="text-xl font-semibold">Agendamentos</h1>
        <p className="mt-2 text-sm text-red-600">Erro ao carregar serviços: {servicesError.message}</p>
      </div>
    );
  }

  const barbers = (barbersData ?? []) as BarberRow[];
  const services = (servicesData ?? []) as ServiceRow[];

  let q = supabase
    .from("appointments")
    .select(
      `
      id,
      appointment_date,
      appointment_time,
      status,
      client_name,
      client_phone,
      barber_id,
      service_id,
      barber:barbers ( id, name ),
      service:services ( id, name )
    `
    )
    .order("appointment_date", { ascending: true })
    .order("appointment_time", { ascending: true });

  if (dateFilter) q = q.eq("appointment_date", dateFilter);
  if (statusFilter) q = q.eq("status", statusFilter);

  const { data: appointmentsData, error: appointmentsError } = await q;

  if (appointmentsError) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-6">
        <h1 className="text-xl font-semibold">Agendamentos</h1>
        <p className="mt-2 text-sm text-red-600">
          Erro ao carregar agendamentos: {appointmentsError.message}
        </p>
      </div>
    );
  }

  const appointments = (appointmentsData ?? []) as unknown as AppointmentRow[];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">Agendamentos</h1>
        <p className="mt-1 text-sm opacity-70">
          Gerencie agendamentos: reagendar, atribuir barbeiro e cancelar.
        </p>
      </header>

      {/* Filtros */}
      <section className="rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-lg font-medium">Filtros</h2>

        <form action={setAppointmentsFilter} className="mt-4 grid gap-3 sm:grid-cols-3">
          <input
            type="date"
            name="date"
            defaultValue={dateFilter || todayISO()}
            className="h-11 rounded-xl border border-black/10 px-4"
          />

          <select
            name="status"
            defaultValue={statusFilter}
            className="h-11 rounded-xl border border-black/10 bg-white px-3"
          >
            <option value="">Todos</option>
            <option value="active">Ativos</option>
            <option value="cancelled">Cancelados</option>
          </select>

          <button className="h-11 rounded-xl border border-black/10 px-4 text-sm transition hover:border-black/30">
            Aplicar
          </button>
        </form>
      </section>

      {/* Lista */}
      <section className="rounded-2xl border border-black/10 bg-white">
        <div className="flex items-center justify-between border-b border-black/10 px-6 py-4">
          <h2 className="text-lg font-medium">Lista</h2>
          <div className="text-sm opacity-70">Total: {appointments.length}</div>
        </div>

        {appointments.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm opacity-60">
            Nenhum agendamento encontrado para os filtros atuais.
          </div>
        ) : (
          <ul className="divide-y divide-black/10">
            {appointments.map((a) => {
              const isCancelled = a.status === "cancelled";

              return (
                <li key={a.id} className="px-6 py-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm opacity-70">
                          {a.appointment_date} • {asHHMM(a.appointment_time)}
                        </span>
                        <span
                          className={[
                            "rounded-full border px-2 py-0.5 text-xs",
                            isCancelled
                              ? "border-black/10 bg-white text-black/50"
                              : "border-black/15 bg-black/5 text-black/80",
                          ].join(" ")}
                        >
                          {isCancelled ? "Cancelado" : "Ativo"}
                        </span>
                      </div>

                      <div className="mt-2 font-medium">{a.client_name}</div>
                      <div className="text-sm opacity-70">{a.client_phone}</div>

                      <div className="mt-2 text-sm opacity-70">
                        {a.service?.name ?? "Serviço"} •{" "}
                        {a.barber?.name ?? "Barbeiro a definir"}
                      </div>

                      <div className="mt-1 text-xs opacity-60">ID: {a.id}</div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {/* Editar / Reagendar */}
                      <details className="group">
                        <summary className="cursor-pointer list-none rounded-xl border border-black/10 px-4 py-2 text-sm transition hover:border-black/30">
                          Editar
                        </summary>

                        <div className="mt-2 rounded-2xl border border-black/10 bg-white p-4">
                          <form action={updateAppointment} className="grid gap-3 md:grid-cols-4">
                            <input type="hidden" name="id" value={a.id} />

                            <input
                              type="date"
                              name="appointment_date"
                              defaultValue={a.appointment_date}
                              required
                              className="h-11 rounded-xl border border-black/10 px-4"
                            />

                            <input
                              type="time"
                              name="appointment_time"
                              defaultValue={asHHMM(a.appointment_time)}
                              required
                              className="h-11 rounded-xl border border-black/10 px-4"
                            />

                            <select
                              name="service_id"
                              defaultValue={a.service_id}
                              required
                              className="h-11 rounded-xl border border-black/10 bg-white px-3"
                            >
                              {services.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name}
                                </option>
                              ))}
                            </select>

                            <select
                              name="barber_id"
                              defaultValue={a.barber_id ?? ""}
                              className="h-11 rounded-xl border border-black/10 bg-white px-3"
                            >
                              <option value="">Barbeiro a definir</option>
                              {barbers
                                .filter((b) => b.active)
                                .map((b) => (
                                  <option key={b.id} value={b.id}>
                                    {b.name}
                                  </option>
                                ))}
                            </select>

                            <button className="h-11 rounded-xl bg-black px-5 text-sm font-medium text-white transition hover:opacity-90 md:col-span-4 md:justify-self-start">
                              Salvar
                            </button>
                          </form>
                        </div>
                      </details>

                      {/* Cancelar / Reativar */}
                      {isCancelled ? (
                        <form action={reactivateAppointment}>
                          <input type="hidden" name="id" value={a.id} />
                          <button
                            className="rounded-xl border border-black/10 px-4 py-2 text-sm transition hover:border-black/30"
                            type="submit"
                          >
                            Reativar
                          </button>
                        </form>
                      ) : (
                        <form action={cancelAppointment}>
                          <input type="hidden" name="id" value={a.id} />
                          <button
                            className="rounded-xl border border-black/10 px-4 py-2 text-sm transition hover:border-black/30"
                            type="submit"
                          >
                            Cancelar
                          </button>
                        </form>
                      )}

                      {/* Excluir (opcional) */}
                      <form action={deleteAppointment}>
                        <input type="hidden" name="id" value={a.id} />
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
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}