import { createSupabaseServer } from "@/lib/supabase/server";
import { Scissors, Clock, DollarSign, Plus, Trash2, Edit3, AlertTriangle, Save } from "lucide-react";
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
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return <ErrorState message={error.message} />;

  const services = (data ?? []) as ServiceRow[];

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-4 md:p-10">
      <div className="mx-auto max-w-4xl space-y-8">
        
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-black">Serviços</h1>
            <p className=" font-light text-black/50">Gerencie o catálogo de cortes, barbas e tratamentos.</p>
          </div>
          <div className="flex h-12 items-center gap-2 rounded-2xl bg-black/5 px-4 text-sm text-black/40">
            <Scissors size={18} /> {services.length} Cadastrados
          </div>
        </header>

        {/* Card de Criação */}
        <section className="rounded-4xl border border-black/5 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
              <Plus size={20} />
            </div>
            <h2 className="text-lg font-medium">Novo Serviço</h2>
          </div>

          <form action={createService} className="grid gap-4 sm:grid-cols-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[10px] font-medium uppercase tracking-wide text-black/40 ml-1">Nome</label>
              <input name="name" placeholder="Ex: Corte Degradê" required className="h-12 w-full rounded-2xl border border-black/10 bg-black/2 px-4 focus:border-black outline-none transition" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium uppercase tracking-wide text-black/40 ml-1">Tempo (min)</label>
              <input name="duration_minutes" type="number" defaultValue={30} step={5} required className="h-12 w-full rounded-2xl border border-black/10 bg-black/2 px-4 focus:border-black outline-none transition" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium uppercase tracking-wide text-black/40 ml-1">Preço (R$)</label>
              <input name="price" placeholder="0,00" required className="h-12 w-full rounded-2xl border border-black/10 bg-black/2 px-4 focus:border-black outline-none transition" />
            </div>
            <button className="sm:col-span-4 h-12 rounded-2xl bg-black font-light text-white transition hover:bg-black/80 active:scale-[0.98]">
              Adicionar ao Catálogo
            </button>
          </form>
        </section>

        {/* Lista de Serviços */}
        <div className="space-y-4">
          {services.length === 0 ? (
            <div className="rounded-4xl border-2 border-dashed border-black/5 p-12 text-center text-black/30">
              Nenhum serviço disponível.
            </div>
          ) : (
            services.map((s) => (
              <div key={s.id} className="group overflow-hidden rounded-4xl border border-black/10 bg-white transition-all hover:shadow-md">
                <details className="group/details">
                  <summary className="flex cursor-pointer list-none items-center justify-between p-6 outline-none">
                    <div className="flex flex-1 items-center gap-6">
                      <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-black/5 text-black/40 sm:flex">
                        <Scissors size={20} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-light text-black">{s.name}</h3>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-xs text-black/40">
                            <Clock size={12} /> {s.duration_minutes} min
                          </span>
                          <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                            <DollarSign size={12} /> {formatBRLFromCents(s.price_cents)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 rounded-xl bg-black/5 px-4 py-2 text-xs font-medium text-black/60 transition group-hover/details:bg-black group-hover/details:text-white">
                        <Edit3 size={14} /> Editar
                      </div>
                    </div>
                  </summary>

                  {/* Formulário de Edição - Agora fora do fluxo lateral do summary */}
                  <div className="border-t border-black/5 bg-[#FAFAFA] p-6 animate-in slide-in-from-top-2 duration-300">
                    <form action={updateService} className="grid gap-4 sm:grid-cols-4">
                      <input type="hidden" name="id" value={s.id} />
                      
                      <div className="sm:col-span-2">
                        <input name="name" defaultValue={s.name} required className="h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-sm outline-none focus:border-black" />
                      </div>
                      <div>
                        <input name="duration_minutes" type="number" defaultValue={s.duration_minutes} step={5} required className="h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-sm outline-none focus:border-black" />
                      </div>
                      <div>
                        <input name="price" defaultValue={centsToBRInput(s.price_cents)} required className="h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-sm outline-none focus:border-black" />
                      </div>

                      <div className="sm:col-span-4 flex items-center justify-between gap-4 pt-2">
                        <div className="flex items-center gap-2 text-red-500/60">
                          <AlertTriangle size={14} />
                          <span className="text-[10px] font-medium uppercase tracking-tight">Cuidado ao excluir</span>
                        </div>
                        <div className="flex gap-2">
                          <button type="submit" className="flex items-center gap-2 rounded-xl bg-black px-6 py-2.5 text-xs font-medium text-white hover:bg-black/80">
                            <Save size={14} /> Salvar
                          </button>
                        </div>
                      </div>
                    </form>

                    <div className="mt-3 flex justify-end">
                      <DeleteServiceButton id={s.id} />
                    </div>
                  </div>
                </details>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function DeleteServiceButton({ id }: { id: string }) {
    return (
        <form action={deleteService}>
            <input type="hidden" name="id" value={id} />
            <button className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-6 py-2.5 text-xs font-medium text-red-600 hover:bg-red-100 transition">
                <Trash2 size={14} /> Excluir
            </button>
        </form>
    )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md rounded-3xl border border-red-100 bg-red-50 p-8 text-center text-red-700">
        <h2 className="text-xl font-semibold italic">Erro no sistema</h2>
        <p className="mt-2 text-sm opacity-80">{message}</p>
      </div>
    </div>
  );
}