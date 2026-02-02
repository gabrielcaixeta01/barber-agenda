import { createSupabaseServer } from "@/lib/supabase/server";
import {
  Calendar,
  Clock,
  User,
  Scissors,
  Phone,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  Trash2,
  RefreshCcw,
  UserCheck,
} from "lucide-react";
import {
  cancelAppointment,
  reactivateAppointment,
  updateAppointment,
  deleteAppointment,
  setAppointmentsFilter,
} from "./actions";

type BarberRow = { id: string; name: string };
type ServiceRow = { id: string; name: string; duration_minutes: number };

type AppointmentStatus = "active" | "cancelled" | "completed";

type AppointmentRow = {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: AppointmentStatus;
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
  const statusFilter = (sp.status ?? "").trim();

  const supabase = await createSupabaseServer();

  const [bRes, sRes] = await Promise.all([
    supabase.from("barbers").select("id, name").order("name"),
    supabase.from("services").select("id, name, duration_minutes").order("name"),
  ]);

  if (bRes.error || sRes.error) return <ErrorState message="Erro ao carregar dependências." />;

  const barbers = (bRes.data ?? []) as BarberRow[];
  const services = (sRes.data ?? []) as ServiceRow[];

  let q = supabase
    .from("appointments")
    .select(
      `id, appointment_date, appointment_time, status, client_name, client_phone, barber_id, service_id, barber:barbers ( id, name ), service:services ( id, name )`
    )
    .order("appointment_date", { ascending: true })
    .order("appointment_time", { ascending: true });

  if (dateFilter) q = q.eq("appointment_date", dateFilter);
  if (statusFilter) q = q.eq("status", statusFilter);

  const { data: appointmentsData, error } = await q;
  if (error) return <ErrorState message={error.message} />;

  const appointments = (appointmentsData ?? []) as unknown as AppointmentRow[];

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-black">Agendamentos</h1>
            <p className="text-black/50">Controle de fluxo e agenda da barbearia.</p>
          </div>
          <div className="flex gap-2">
            <StatCard label="Total" value={appointments.length} />
            <StatCard
              label="Ativos"
              value={appointments.filter((a) => a.status === "active").length}
              color="text-emerald-600"
            />
          </div>
        </header>

        <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-black/40">
            <Filter size={14} /> Filtros de busca
          </div>
          <form action={setAppointmentsFilter} className="grid grid-cols-1 gap-4 sm:grid-cols-12">
            <div className="sm:col-span-5">
              <input
                type="date"
                name="date"
                defaultValue={dateFilter || todayISO()}
                className="h-12 w-full rounded-2xl border border-black/10 px-4 outline-none transition focus:border-black"
              />
            </div>
            <div className="sm:col-span-4">
              <select
                name="status"
                defaultValue={statusFilter}
                className="h-12 w-full appearance-none rounded-2xl border border-black/10 bg-white px-4 outline-none transition focus:border-black"
              >
                <option value="">Todos os status</option>
                <option value="active">Ativos</option>
                <option value="completed">Concluídos</option>
                <option value="cancelled">Cancelados</option>
              </select>
            </div>
            <button className="h-12 rounded-2xl bg-black font-bold text-white transition hover:bg-black/80 sm:col-span-3">
              Aplicar Filtros
            </button>
          </form>
        </section>

        <div className="space-y-4">
          {appointments.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-black/5 p-12 text-center text-black/30">
              Nenhum agendamento encontrado.
            </div>
          ) : (
            appointments.map((a) => (
              <AppointmentCard key={a.id} appointment={a} barbers={barbers} services={services} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function AppointmentCard({
  appointment: a,
  barbers,
  services,
}: {
  appointment: AppointmentRow;
  barbers: BarberRow[];
  services: ServiceRow[];
}) {
  const isCancelled = a.status === "cancelled";
  const isCompleted = a.status === "completed";

  return (
    <div
      className={[
        "relative overflow-hidden rounded-3xl border bg-white transition-all",
        isCancelled ? "border-black/5 opacity-60" : "border-black/10 shadow-sm hover:shadow-md",
      ].join(" ")}
    >
      <div
        className={[
          "absolute bottom-0 left-0 top-0 w-1.5",
          isCancelled ? "bg-gray-300" : isCompleted ? "bg-blue-500" : "bg-emerald-500",
        ].join(" ")}
      />

      <div className="p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-full bg-black/5 px-3 py-1 text-sm font-bold">
                <Calendar size={14} /> {a.appointment_date.split("-").reverse().join("/")}
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-black/5 px-3 py-1 text-sm font-bold">
                <Clock size={14} /> {asHHMM(a.appointment_time)}
              </div>
              <StatusBadge status={a.status} />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-black/30">Cliente</p>
                <h3 className="text-lg font-bold text-black">{a.client_name}</h3>
                <p className="flex items-center gap-1.5 text-sm text-black/60">
                  <Phone size={14} /> {a.client_phone}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-black/30">
                  Serviço & Profissional
                </p>
                <p className="flex items-center gap-2 text-sm font-semibold text-black/80">
                  <Scissors size={14} className="text-black/30" /> {a.service?.name ?? "Serviço"}
                </p>
                <p className="flex items-center gap-2 text-sm font-semibold text-black/80">
                  <User size={14} className="text-black/30" /> {a.barber?.name ?? "Pendente"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-black/5 pt-4 lg:border-none lg:pt-0">
            <details className="group relative">
              <summary className="list-none">
                <div className="flex cursor-pointer items-center gap-2 rounded-xl border border-black/10 px-4 py-2 text-sm font-bold hover:bg-black/5">
                  <MoreHorizontal size={16} /> Detalhes
                </div>
              </summary>
              <div className="absolute right-0 z-20 mt-2 w-72 rounded-3xl border border-black/10 bg-white p-5 shadow-2xl animate-in fade-in zoom-in-95">
                <form action={updateAppointment} className="space-y-3">
                  <input type="hidden" name="id" value={a.id} />
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-black/40">Reagendar</label>
                    <input
                      type="date"
                      name="appointment_date"
                      defaultValue={a.appointment_date}
                      className="w-full rounded-xl border p-2 text-sm"
                    />
                    <input
                      type="time"
                      name="appointment_time"
                      defaultValue={asHHMM(a.appointment_time)}
                      className="w-full rounded-xl border p-2 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-black/40">Barbeiro</label>
                    <select
                      name="barber_id"
                      defaultValue={a.barber_id ?? ""}
                      className="w-full rounded-xl border p-2 text-sm"
                    >
                      <option value="">A definir</option>
                      {barbers.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-black/40">Serviço</label>
                    <select
                      name="service_id"
                      defaultValue={a.service_id}
                      className="w-full rounded-xl border p-2 text-sm"
                    >
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button className="w-full rounded-xl bg-black py-2 text-xs font-bold text-white transition hover:bg-black/80">
                    Salvar Alterações
                  </button>
                </form>
              </div>
            </details>

            {isCancelled ? (
              <form action={reactivateAppointment}>
                <input type="hidden" name="id" value={a.id} />
                <button className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100">
                  <RefreshCcw size={16} /> Reativar
                </button>
              </form>
            ) : (
              <form action={cancelAppointment}>
                <input type="hidden" name="id" value={a.id} />
                <button className="flex items-center gap-2 rounded-xl border border-black/10 px-4 py-2 text-sm font-bold text-black/60 transition hover:bg-red-50 hover:text-red-600">
                  <XCircle size={16} /> Cancelar
                </button>
              </form>
            )}

            <form action={deleteAppointment}>
              <input type="hidden" name="id" value={a.id} />
              <button className="flex items-center justify-center rounded-xl border border-black/5 p-2 text-black/20 transition hover:bg-red-50 hover:text-red-600">
                <Trash2 size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const configs: Record<
    AppointmentStatus,
    { icon: typeof UserCheck; label: string; className: string }
  > = {
    active: {
      icon: UserCheck,
      label: "Ativo",
      className: "border-emerald-100 bg-emerald-50 text-emerald-700",
    },
    completed: {
      icon: CheckCircle2,
      label: "Concluído",
      className: "border-blue-100 bg-blue-50 text-blue-700",
    },
    cancelled: {
      icon: XCircle,
      label: "Cancelado",
      className: "border-gray-200 bg-gray-100 text-gray-500",
    },
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <span
      className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-tight ${config.className}`}
    >
      <Icon size={12} /> {config.label}
    </span>
  );
}

function StatCard({
  label,
  value,
  color = "text-black",
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white px-4 py-2 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-widest text-black/30">{label}</p>
      <p className={`text-xl font-black ${color}`}>{value}</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="rounded-3xl border border-red-100 bg-red-50 p-8 text-center text-red-700">
        <AlertCircle className="mx-auto mb-4" size={40} />
        <h2 className="text-xl font-bold">Ops! Algo deu errado.</h2>
        <p className="mt-2 text-sm opacity-80">{message}</p>
      </div>
    </div>
  );
}