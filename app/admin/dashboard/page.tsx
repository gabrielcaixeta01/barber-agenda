import { getAdminStats, getTodayAppointments } from "@/lib/admin/queries";

export default async function AdminHomePage() {
  const [stats, appointments] = await Promise.all([
    getAdminStats(),
    getTodayAppointments(),
  ]);

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-4xl space-y-8">
        <header>
          <h1 className="text-2xl font-semibold">Agenda</h1>
          <p className="mt-1 text-sm opacity-70">
            Visão geral dos atendimentos da barbearia
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard title="Agendamentos hoje" value={String(stats.appointmentsToday)} />
          <StatCard title="Agendamentos na semana" value={String(stats.appointmentsWeek)} />
          <StatCard title="Barbeiros ativos" value={String(stats.activeBarbers)} />
        </section>

        <section className="rounded-2xl border border-black/10 bg-white">
          <div className="border-b border-black/10 px-6 py-4">
            <h2 className="text-lg font-medium">Agenda do dia</h2>
          </div>

          {appointments.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm opacity-60">
              Nenhum agendamento para hoje.
            </div>
          ) : (
            <ul className="divide-y divide-black/10">
              {appointments.map((a) => (
                <li key={a.id} className="px-6 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm opacity-70">{String(a.appointment_time).slice(0, 5)}</div>
                      <div className="font-medium">{a.client_name}</div>
                      <div className="text-sm opacity-70">
                        {a.service?.name ?? "Serviço"} • {a.barber?.name ?? "Barbeiro a definir"}
                      </div>
                    </div>

                    <div className="text-sm opacity-70">{a.client_phone}</div>
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

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <div className="text-sm opacity-60">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}