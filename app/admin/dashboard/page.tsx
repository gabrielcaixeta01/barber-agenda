import Link from "next/link";
import WeekGrid from "@/components/admin/WeekGrid";
import {
  getAdminBarbers,
  getAdminServices,
  getAdminStats,
  getTodayAppointments,
  getWeekAppointments,
} from "@/lib/admin/queries";
import type { AdminWeekAppointment } from "@/types/admin";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function startOfWeekISO(base = new Date()) {
  // semana começando na segunda (pt-BR)
  const d = new Date(base);
  const day = d.getDay(); // 0 dom ... 6 sab
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return toISODate(d);
}

function addDaysISO(iso: string, add: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  dt.setDate(dt.getDate() + add);
  return toISODate(dt);
}

function formatDayLabel(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  return dt.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" });
}

function buildTimeRows(start = "09:00", end = "19:00", stepMin = 30) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const rows: string[] = [];

  let minutes = (sh ?? 0) * 60 + (sm ?? 0);
  const endMin = (eh ?? 0) * 60 + (em ?? 0);

  while (minutes <= endMin) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    rows.push(`${pad2(h)}:${pad2(m)}`);
    minutes += stepMin;
  }
  return rows;
}

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams?: Promise<{ barberId?: string; serviceId?: string }>;
}) {
  // Depois você pode trocar por weekStart vindo da URL (?week=yyyy-mm-dd)
  const weekStart = startOfWeekISO(new Date());
  const days = Array.from({ length: 7 }, (_, i) => addDaysISO(weekStart, i));
  const dayLabels = days.map((d) => formatDayLabel(d));

  const sp = await searchParams;
  const filters = {
    barberId: sp?.barberId?.trim() || undefined,
    serviceId: sp?.serviceId?.trim() || undefined,
  };

  const [stats, today, barbers, services, weekAppointments] = await Promise.all([
    getAdminStats(),
    getTodayAppointments(),
    getAdminBarbers(),
    getAdminServices(),
    getWeekAppointments({
      weekStartISO: days[0],
      weekEndISO: days[6],
      filters,
    }),
  ]);

  const timeRows = buildTimeRows("09:00", "19:00", 30);
  const appointmentsCount = weekAppointments.length;
  const uniqueClients = new Set(weekAppointments.map((a) => a.client_phone)).size;
  const estimatedRevenueCents = weekAppointments.reduce(
    (sum, a) => sum + (a.service?.price_cents ?? 0),
    0
  );

  const barberCount = filters.barberId ? 1 : barbers.length || 1;
  const totalSlots = timeRows.length * days.length * barberCount;
  const occupancy = totalSlots > 0 ? (appointmentsCount / totalSlots) * 100 : 0;

  const topServices = Object.entries(
    weekAppointments.reduce<Record<string, number>>((acc, a) => {
      const key = a.service?.name ?? "Serviço";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const topBarbers = Object.entries(
    weekAppointments.reduce<Record<string, number>>((acc, a) => {
      const key = a.barber?.name ?? "A definir";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const currency = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="mt-1 text-sm opacity-70">Visão geral dos atendimentos da barbearia</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/agendamentos/novo"
              className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90"
            >
              Novo agendamento
            </Link>
          </div>
        </header>

        {/* Top stats */}
        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard title="Agendamentos hoje" value={String(stats.appointmentsToday)} />
          <StatCard title="Agendamentos na semana" value={String(stats.appointmentsWeek)} />
          <StatCard title="Barbeiros" value={String(stats.totalBarbers)} />
        </section>

        {/* Filters */}
        <section className="rounded-2xl border border-black/10 bg-white p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-medium">Semana atual</h2>
              <p className="mt-1 text-sm opacity-70">
                {formatDayLabel(days[0])} → {formatDayLabel(days[6])}
              </p>
            </div>

            <form method="get" className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <select
                name="barberId"
                defaultValue={filters.barberId ?? ""}
                className="h-10 rounded-xl border border-black/10 bg-white px-3 text-sm"
              >
                <option value="">Todos os barbeiros</option>
                {barbers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>

              <select
                name="serviceId"
                defaultValue={filters.serviceId ?? ""}
                className="h-10 rounded-xl border border-black/10 bg-white px-3 text-sm"
              >
                <option value="">Todos os serviços</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <button className="h-10 rounded-xl border border-black/10 bg-white px-3 text-sm hover:bg-black/5">
                Aplicar
              </button>

              <Link
                href="/admin/dashboard"
                className="h-10 rounded-xl border border-black/10 bg-white px-3 text-sm hover:bg-black/5 inline-flex items-center justify-center"
              >
                Limpar
              </Link>
            </form>
          </div>
        </section>

        {/* Week grid */}
        <section className="rounded-2xl border border-black/10 bg-white">
          <div className="border-b border-black/10 px-6 py-4">
            <h2 className="text-lg font-medium">Visão semanal</h2>
            <p className="mt-1 text-sm opacity-70">
              Dias x horários. Clique em um card para ver detalhes.
            </p>
          </div>

          <WeekGrid
            days={days}
            dayLabels={dayLabels}
            timeRows={timeRows}
            weekAppointments={weekAppointments as AdminWeekAppointment[]}
            barbers={barbers}
            services={services}
          />
        </section>

        {/* Bottom KPIs (semana) */}
        <section className="grid gap-4 sm:grid-cols-4">
          <MiniKpi
            title="Faturamento Semanal Estimado"
            value={currency.format(estimatedRevenueCents / 100)}
            hint="Somatório dos serviços (sem descontos)"
          />
          <MiniKpi
            title="Clientes"
            value={String(uniqueClients)}
            hint="Total de clientes distintos"
          />
          <MiniKpi
            title="Taxa de ocupação"
            value={`${occupancy.toFixed(1)}%`}
            hint="Slots ocupados ÷ slots totais"
          />
          <MiniKpi
            title="Agendamentos"
            value={String(appointmentsCount)}
            hint="Total na semana"
          />
        </section>

        {/* Tops */}
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-black/10 bg-white p-5">
            <div className="text-sm opacity-60">Top serviços</div>
            <div className="mt-2 space-y-2">
              {topServices.length === 0 ? (
                <div className="text-sm opacity-60">Sem dados</div>
              ) : (
                topServices.map(([name, count]) => (
                  <div key={name} className="flex items-center justify-between text-sm">
                    <span>{name}</span>
                    <span className="opacity-60">{count}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-5">
            <div className="text-sm opacity-60">Top barbeiros</div>
            <div className="mt-2 space-y-2">
              {topBarbers.length === 0 ? (
                <div className="text-sm opacity-60">Sem dados</div>
              ) : (
                topBarbers.map(([name, count]) => (
                  <div key={name} className="flex items-center justify-between text-sm">
                    <span>{name}</span>
                    <span className="opacity-60">{count}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Today list (mantém sua seção atual) */}
        <section className="rounded-2xl border border-black/10 bg-white">
          <div className="border-b border-black/10 px-6 py-4">
            <h2 className="text-lg font-medium">Agenda de hoje</h2>
          </div>

          {today.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm opacity-60">Nenhum agendamento para hoje.</div>
          ) : (
            <ul className="divide-y divide-black/10">
              {today.map((a) => (
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

function MiniKpi({
  title,
  value,
  hint,
}: {
  title: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <div className="text-sm opacity-60">{title}</div>
      <div className="mt-2 text-xl font-semibold">{value}</div>
      <div className="mt-2 text-xs opacity-60">{hint}</div>
    </div>
  );
}