import { createSupabaseServer } from "@/lib/supabase/server";
import Link from "next/link";
import { Clock, User, Scissors, XCircle, Trash2, RefreshCcw, History, CalendarDays, Edit2, ChevronDown, CheckCircle2, AlertCircle } from "lucide-react";
import { cancelAppointment, reactivateAppointment, updateAppointment, deleteAppointment, setAppointmentsFilter } from "./actions";

type BarberRow = { id: string; name: string };

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
  searchParams: Promise<{ date?: string; status?: string; view?: "upcoming" | "history" }>;
}) {
  const sp = await searchParams;
  const dateFilter = (sp.date ?? "").trim();
  const statusFilter = (sp.status ?? "").trim();
  const currentView = sp.view ?? "upcoming";

  const supabase = await createSupabaseServer();
  const today = todayISO();

  const [bRes] = await Promise.all([
    supabase.from("barbers").select("id, name").order("name"),
    supabase.from("services").select("id, name").order("name"),
  ]);

  const barbers = (bRes.data ?? []) as BarberRow[];

  let q = supabase
    .from("appointments")
    .select(`id, appointment_date, appointment_time, status, client_name, client_phone, barber_id, service_id, barber:barbers ( id, name ), service:services ( id, name )`);

  if (currentView === "upcoming") {
    q = q.gte("appointment_date", today).order("appointment_date", { ascending: true });
    if (!statusFilter) q = q.neq("status", "cancelled");
  } else {
    q = q.lt("appointment_date", today).order("appointment_date", { ascending: false });
  }

  if (dateFilter) q = q.eq("appointment_date", dateFilter);
  if (statusFilter) q = q.eq("status", statusFilter);

  const { data: appointmentsData, error } = await q.order("appointment_time", { ascending: true });
  if (error) return <ErrorState message={error.message} />;
  const appointments = (appointmentsData ?? []) as unknown as AppointmentRow[];

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 p-4 md:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        
        <header className="flex items-center justify-between px-2">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-black">Agenda</h1>
            <p className="text-sm text-black/40">Gestão de atendimentos</p>
          </div>
          <StatCard label="Ativos" value={appointments.filter(a => a.status === 'active').length} color="text-emerald-600" />
        </header>

        {/* Tabs Estilizadas */}
        <div className="flex rounded-3xl bg-black/5 p-1.5">
          <Link 
            href="?view=upcoming"
            className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-medium transition-all ${currentView === 'upcoming' ? 'bg-white text-black shadow-sm' : 'text-black/40 hover:text-black/60'}`}
          >
            <CalendarDays size={18} /> Próximos
          </Link>
          <Link 
            href="?view=history"
            className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-medium transition-all ${currentView === 'history' ? 'bg-white text-black shadow-sm' : 'text-black/40 hover:text-black/60'}`}
          >
            <History size={18} /> Histórico
          </Link>
        </div>

        {/* Filtros Minimalistas */}
        <section className="rounded-4xl border border-black/3 bg-white p-6 shadow-sm md:p-5">
          <form action={setAppointmentsFilter} className="flex flex-col gap-3 sm:flex-row">
            <input
              type="date"
              name="date"
              defaultValue={dateFilter}
              className="h-12 flex-1 rounded-2xl border border-black/5 bg-black/2 px-4 text-sm outline-none focus:border-black transition-colors"
            />
            <select
              name="status"
              defaultValue={statusFilter}
              className="h-12 flex-1 rounded-2xl border border-black/5 bg-black/2 px-4 text-sm outline-none focus:border-black transition-colors appearance-none"
            >
              <option value="">Todos os status</option>
              <option value="active">Ativos</option>
              <option value="completed">Concluídos</option>
              <option value="cancelled">Cancelados</option>
            </select>
            <button className="h-12 rounded-2xl bg-black px-8 font-medium text-white transition hover:bg-black/80 active:scale-95">
              Filtrar
            </button>
          </form>
        </section>

        {/* Lista de Cards */}
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <div className="py-20 text-center font-light text-black/20">Nenhum registro encontrado.</div>
          ) : (
            appointments.map((a) => (
              <AppointmentCard key={a.id} appointment={a} barbers={barbers} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function AppointmentCard({ appointment: a, barbers }: { appointment: AppointmentRow; barbers: BarberRow[] }) {
  const isCancelled = a.status === "cancelled";

  return (
    <div className={`group rounded-[2.5rem] border border-black/4 bg-white transition-all hover:border-black/10 ${isCancelled ? "opacity-60" : "shadow-sm"}`}>
      <details className="group/edit overflow-hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between p-5 outline-none md:p-6">
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-xl bg-black px-3 py-1.5 text-[11px] font-medium text-white">
                <Clock size={12} /> {a.appointment_time.slice(0, 5)}
              </span>
              <span className="text-[11px] font-medium text-black/30">
                {a.appointment_date.split('-').reverse().slice(0,2).join('/')}
              </span>
              <StatusBadge status={a.status} />
            </div>

            <div>
              <h3 className="text-xl font-light tracking-tight text-black">{a.client_name}</h3>
              <p className="text-xs font-light text-black/40">{a.client_phone}</p>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-black/3 pt-4">
              <div className="flex items-center gap-2 text-xs text-black/60">
                <Scissors size={14} className="text-black/20" /> {a.service?.name}
              </div>
              <div className="flex items-center gap-2 text-xs text-black/60">
                <User size={14} className="text-black/20" /> {a.barber?.name ?? "Pendente"}
              </div>
            </div>
          </div>

          <div className="ml-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-black/3 text-black/20 transition-colors group-hover/edit:bg-black group-hover/edit:text-white">
            <Edit2 size={18} className="group-open/edit:hidden" />
            <ChevronDown size={18} className="hidden group-open/edit:block" />
          </div>
        </summary>

        {/* Painel de Edição Expansível (Resolve o bug do overflow) */}
        <div className="border-t border-black/3 bg-black/2 p-6 animate-in slide-in-from-top-2 duration-300">
          <div className="grid gap-6 md:grid-cols-2">
            
            <form action={updateAppointment} className="space-y-4">
              <p className="text-[10px] font-medium uppercase tracking-wide text-black/40">Reagendar / Alterar</p>
              <input type="hidden" name="id" value={a.id} />
              <div className="grid grid-cols-2 gap-2">
                <input type="date" name="appointment_date" defaultValue={a.appointment_date} className="rounded-xl border border-black/5 bg-white p-3 text-xs shadow-sm outline-none focus:border-black" />
                <input type="time" name="appointment_time" defaultValue={a.appointment_time.slice(0,5)} className="rounded-xl border border-black/5 bg-white p-3 text-xs shadow-sm outline-none focus:border-black" />
              </div>
              <select name="barber_id" defaultValue={a.barber_id || ""} className="w-full rounded-xl border border-black/5 bg-white p-3 text-xs shadow-sm outline-none focus:border-black">
                <option value="">Selecionar Barbeiro...</option>
                {barbers.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-black py-3 text-xs font-medium text-white transition hover:bg-black/80">
                <CheckCircle2 size={14} /> Atualizar Agendamento
              </button>
            </form>

            <div className="space-y-4">
              <p className="text-[10px] font-medium uppercase tracking-wide text-black/40">Ações de Status</p>
              <div className="grid grid-cols-1 gap-2">
                {isCancelled ? (
                  <form action={reactivateAppointment}>
                    <input type="hidden" name="id" value={a.id} />
                    <button className="flex w-full items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition">
                      <RefreshCcw size={16} /> Reativar Atendimento
                    </button>
                  </form>
                ) : (
                  <form action={cancelAppointment}>
                    <input type="hidden" name="id" value={a.id} />
                    <button className="flex w-full items-center gap-3 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 text-xs font-medium text-orange-700 hover:bg-orange-100 transition">
                      <XCircle size={16} /> Cancelar Horário
                    </button>
                  </form>
                )}
                
                <form action={deleteAppointment} className="pt-2">
                  <input type="hidden" name="id" value={a.id} />
                  <button className="flex w-full items-center gap-3 rounded-xl border border-red-50 px-4 py-3 text-xs font-medium text-red-400 hover:bg-red-500 hover:text-white transition">
                    <Trash2 size={16} /> Excluir Registro
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </details>
    </div>
  );
}

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const styles = {
    active: "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20",
    completed: "bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/20",
    cancelled: "bg-red-500/10 text-red-600 ring-1 ring-red-500/20",
  };
  const labels = { active: "Ativo", completed: "Concluído", cancelled: "Cancelado" };
  return (
    <span className={`rounded-lg px-2 py-0.5 text-[10px] font-light uppercase tracking-tight ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-right">
      <p className="text-[10px] font-medium uppercase tracking-wide text-black/40">{label}</p>
      <p className={`text-2xl font-light ${color}`}>{value}</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-8">
      <div className="rounded-4xl border border-red-100 bg-red-50 p-6 text-center text-red-600">
        <AlertCircle className="mx-auto mb-2" size={24} />
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}