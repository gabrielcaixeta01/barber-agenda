import { createSupabaseServer } from "@/lib/supabase/server";
import { logoutAdmin } from "../actions";
import { upsertAdminProfile } from "./actions";

export default async function AdminProfilePage() {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen p-6">
        <div className="rounded-2xl border border-black/10 bg-white p-6">
          <h1 className="text-2xl font-semibold">Perfil</h1>
          <p className="mt-2 text-sm opacity-70">Não autenticado.</p>
        </div>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Perfil</h1>
            <p className="mt-1 text-sm opacity-70">Configurações do administrador.</p>
          </div>

          <form action={logoutAdmin}>
            <button className="rounded-xl border border-black/10 px-4 py-2 text-sm transition hover:border-black/30">
              Sair
            </button>
          </form>
        </header>

        <section className="rounded-2xl border border-black/10 bg-white p-6">
          <h2 className="text-lg font-medium">Conta</h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="E-mail" value={user.email ?? "—"} />
            <Field label="User ID" value={user.id} mono />
          </div>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-6">
          <h2 className="text-lg font-medium">Perfil</h2>

          <form action={upsertAdminProfile} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              name="display_name"
              defaultValue={profile?.display_name ?? ""}
              placeholder="Nome exibido (ex: Gabriel)"
              className="h-11 flex-1 rounded-xl border border-black/10 px-4"
              required
            />
            <button className="h-11 rounded-xl bg-black px-5 text-sm font-medium text-white transition hover:opacity-90">
              Salvar
            </button>
          </form>

          <p className="mt-3 text-xs opacity-60">
            Esse nome pode ser usado em mensagens e telas administrativas.
          </p>
        </section>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-black/10 p-4">
      <div className="text-sm opacity-60">{label}</div>
      <div className={mono ? "mt-1 font-mono text-sm" : "mt-1 text-sm"}>{value}</div>
    </div>
  );
}