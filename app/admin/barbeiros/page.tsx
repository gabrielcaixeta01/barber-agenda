import { createSupabaseServer } from "@/lib/supabase/server";
import { CreateBarberForm, BarberActionButtons } from "./BarberForm";
import { setBarberActive } from "./actions";

type BarberRow = {
  id: string;
  name: string;
  active: boolean;
  created_at: string;
};

export default async function AdminBarbersPage() {
  const supabase = await createSupabaseServer();

  const { data, error } = await supabase
    .from("barbers")
    .select("id, name, active, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-6">
        <h1 className="text-xl font-semibold">Barbeiros</h1>
        <p className="mt-2 text-sm text-red-600">
          Erro ao carregar barbeiros: {error.message}
        </p>
      </div>
    );
  }

  const barbers = (data ?? []) as BarberRow[];

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Barbeiros</h1>
          <p className="mt-1 text-sm opacity-70">
            Crie, edite, ative/desative e remova barbeiros.
          </p>
        </div>
      </header>

      {/* Create */}
      <section className="rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-lg font-medium">Adicionar barbeiro</h2>
        <CreateBarberForm />
      </section>

      {/* List */}
      <section className="rounded-2xl border border-black/10 bg-white">
        <div className="flex items-center justify-between border-b border-black/10 px-6 py-4">
          <h2 className="text-lg font-medium">Lista</h2>
          <div className="text-sm opacity-70">
            Total: {barbers.length}
          </div>
        </div>

        {barbers.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm opacity-60">
            Nenhum barbeiro cadastrado.
          </div>
        ) : (
          <ul className="divide-y divide-black/10">
            {barbers.map((b) => (
              <li key={b.id} className="px-6 py-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">{b.name}</span>
                      <span
                        className={[
                          "rounded-full border px-2 py-0.5 text-xs",
                          b.active
                            ? "border-black/15 bg-black/5 text-black/80"
                            : "border-black/10 bg-white text-black/50",
                        ].join(" ")}
                      >
                        {b.active ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                    <div className="mt-1 text-xs opacity-60">
                      ID: {b.id}
                    </div>
                  </div>

                                    <div className="flex flex-wrap gap-2">
                                      {/* Toggle active */}
                                      <form action={async (formData) => {
                                        await setBarberActive(formData);
                                      }}>
                                        <input type="hidden" name="id" value={b.id} />
                                        <input type="hidden" name="active" value={String(!b.active)} />
                                        <button
                                          className="rounded-xl border border-black/10 px-4 py-2 text-sm transition hover:border-black/30"
                                          type="submit"
                                        >
                                          {b.active ? "Desativar" : "Ativar"}
                                        </button>
                                      </form>
                                      <BarberActionButtons id={b.id} name={b.name} active={b.active} />
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </section>
                      </div>
                    );
                  }