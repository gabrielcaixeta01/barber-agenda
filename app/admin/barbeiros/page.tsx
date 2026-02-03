import { createSupabaseServer } from "@/lib/supabase/server";
import { 
  Users, 
  Calendar as CalendarIcon, 
  Plus, 
  Trash2, 
  ChevronDown, 
  UserPlus, 
  Timer
} from "lucide-react";
import {
  createSchedule,
  deleteSchedule,
  createBarber,
  updateBarber,
  deleteBarber,
} from "./actions";

type BarberRow = {
  id: string;
  name: string;
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

  const [{ data: barbersData }, { data: schedulesData }] = await Promise.all([
    supabase.from("barbers").select("id, name").order("name"),
    supabase.from("barber_schedules").select("*").order("day_of_week").order("start_time")
  ]);

  const barbers = (barbersData ?? []) as BarberRow[];
  const schedules = (schedulesData ?? []) as ScheduleRow[];

  const byBarber = new Map<string, ScheduleRow[]>();
  for (const s of schedules) {
    if (!byBarber.has(s.barber_id)) byBarber.set(s.barber_id, []);
    byBarber.get(s.barber_id)!.push(s);
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-black">Equipe</h1>
            <p className="text-black/50">Gerencie seus barbeiros e janelas de atendimento.</p>
          </div>
          <div className="flex h-12 items-center gap-2 rounded-2xl bg-black/5 px-4 text-sm font-bold text-black/40">
            <Users size={18} /> {barbers.length} Profissionais
          </div>
        </header>

        {/* Adicionar Novo Barbeiro */}
        <section className="overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm">
          <details className="group">
            <summary className="flex cursor-pointer items-center justify-between p-6 list-none outline-none">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                  <UserPlus size={20} />
                </div>
                <h2 className="text-lg font-bold">Cadastrar novo barbeiro</h2>
              </div>
              <Plus size={20} className="text-black/20 transition-transform group-open:rotate-45" />
            </summary>
            <div className="border-t border-black/5 p-6 bg-black/1">
              <form action={createBarber} className="flex flex-col gap-3 sm:flex-row">
                <input
                  name="name"
                  placeholder="Nome do profissional"
                  required
                  className="h-12 flex-1 rounded-2xl border border-black/10 bg-white px-4 focus:border-black outline-none transition"
                />
                <button className="h-12 rounded-2xl bg-black px-8 font-bold text-white transition hover:bg-black/80">
                  Criar Cadastro
                </button>
              </form>
            </div>
          </details>
        </section>

        {/* Lista de Barbeiros */}
        <div className="space-y-4">
          {barbers.map((b) => {
            const list = byBarber.get(b.id) ?? [];
            
            return (
              <div key={b.id} className="overflow-hidden rounded-4xl border border-black/10 bg-white shadow-sm transition-all hover:shadow-md">
                
                {/* Accordion Principal: O Barbeiro */}
                <details className="group/barber">
                  <summary className="flex cursor-pointer items-center justify-between p-6 list-none outline-none">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/5 text-xl font-black">
                        {b.name[0].toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-black">{b.name}</h3>
                        <p className="text-sm text-black/40">{list.length} turnos configurados</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <ChevronDown size={20} className="text-black/20 transition-transform group-open/barber:rotate-180" />
                    </div>
                  </summary>

                  <div className="border-t border-black/5 bg-[#FAFAFA] p-6 space-y-8">
                    
                    {/* Sub-Seção: Editar Nome */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-black/30">Dados do Profissional</label>
                      <form action={updateBarber} className="flex gap-2">
                        <input type="hidden" name="id" value={b.id} />
                        <input name="name" defaultValue={b.name} className="h-11 flex-1 rounded-xl border border-black/10 bg-white px-4 text-sm outline-none focus:border-black" />
                        <button className="h-11 rounded-xl bg-black px-4 text-xs font-bold text-white">Renomear</button>
                      </form>
                    </div>

                    {/* Sub-Seção: Excluir Barbeiro */}
                    <div className="flex justify-end">
                      <form action={deleteBarber}>
                        <input type="hidden" name="id" value={b.id} />
                        <button className="h-10 rounded-xl border border-red-200 bg-red-50 px-4 text-xs font-bold text-red-600 transition hover:bg-red-100" title="Excluir Barbeiro">
                          Excluir barbeiro
                        </button>
                      </form>
                    </div>

                    {/* Sub-Seção: Adicionar Horário */}
                    <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <Timer size={18} className="text-black/30" />
                        <h4 className="font-bold text-sm">Novo Período de Trabalho</h4>
                      </div>
                      <form action={createSchedule} className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                        <input type="hidden" name="barber_id" value={b.id} />
                        <select name="day_of_week" className="h-11 rounded-xl border border-black/10 bg-white px-3 text-sm">
                          {DOW.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                        </select>
                        <input name="start_time" type="time" defaultValue="09:00" className="h-11 rounded-xl border border-black/10 px-4 text-sm" />
                        <input name="end_time" type="time" defaultValue="18:00" className="h-11 rounded-xl border border-black/10 px-4 text-sm" />
                        <button className="h-11 rounded-xl bg-black font-bold text-white text-xs hover:bg-black/80 transition">Adicionar</button>
                      </form>
                    </div>

                    {/* Sub-Seção: Lista de Horários */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-black/30">Janelas Atuais</label>
                        {list.length === 0 ? (
                            <p className="text-sm text-black/30 italic">Nenhum horário definido.</p>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2">
                                {list.map((s) => (
                                    <div key={s.id} className="flex items-center justify-between rounded-2xl border border-black/5 bg-white p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="text-black/20"><CalendarIcon size={16} /></div>
                                            <div>
                                                <p className="text-sm font-bold">{dowLabel(s.day_of_week)}</p>
                                                <p className="text-xs text-black/50">{asHHMM(s.start_time)} — {asHHMM(s.end_time)}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            {/* Edição rápida simplificada para não poluir */}
                                            <form action={deleteSchedule}>
                                                <input type="hidden" name="id" value={s.id} />
                                                <button className="p-2 text-black/10 hover:text-red-500 transition"><Trash2 size={16} /></button>
                                            </form>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                  </div>
                </details>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}