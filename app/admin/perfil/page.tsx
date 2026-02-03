import { createSupabaseServer } from "@/lib/supabase/server";
import { logoutAdmin } from "../actions";
import { upsertAdminProfile } from "./actions";
import { 
  User, 
  Mail, 
  ShieldCheck, 
  LogOut, 
  Save, 
  Fingerprint, 
  Calendar,
  BadgeCheck
} from "lucide-react";

export default async function AdminProfilePage() {
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="text-center">
          <ShieldCheck size={48} className="mx-auto mb-4 text-black/10" />
          <p className="text-lg font-medium text-black/50">Sessão expirada ou não autenticada.</p>
        </div>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("display_name, created_at")
    .eq("id", user.id)
    .maybeSingle();

  const initials = profile?.display_name
    ? profile.display_name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
    : user.email?.[0].toUpperCase();

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-4 md:p-10">
      <div className="mx-auto max-w-3xl space-y-8">
        
        {/* HEADER / AVATAR SECTION */}
        <header className="flex flex-col items-center gap-6 rounded-[2.5rem] bg-black p-8 text-white shadow-2xl shadow-black/10 md:flex-row md:p-12">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-white/10 text-3xl font-black text-white ring-4 ring-white/5">
            {initials}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center gap-2 md:justify-start">
              <h1 className="text-3xl font-bold tracking-tight">
                {profile?.display_name || "Administrador"}
              </h1>
              <BadgeCheck size={20} className="text-blue-400" />
            </div>
            <p className="mt-1 text-white/50">{user.email}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-4 md:justify-start">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
                <ShieldCheck size={14} /> Acesso Master
              </div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
                <Calendar size={14} /> Desde {new Date(user.created_at).getFullYear()}
              </div>
            </div>
          </div>

          <form action={logoutAdmin}>
            <button className="group flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-bold transition hover:bg-red-500 hover:text-white">
              <LogOut size={18} className="transition-transform group-hover:-translate-x-1" />
              Sair
            </button>
          </form>
        </header>

        <div className="grid gap-8 md:grid-cols-5">
          {/* LADO ESQUERDO: INFOS FIXAS */}
          <div className="space-y-6 md:col-span-2">
            <h3 className="text-sm font-bold uppercase tracking-widest text-black/30">Segurança</h3>
            <div className="space-y-4">
              <InfoCard 
                label="ID da Conta" 
                value={user.id.slice(0, 12) + "..."} 
                icon={Fingerprint}
                mono 
              />
              <InfoCard 
                label="E-mail de Login" 
                value={user.email ?? "—"} 
                icon={Mail} 
              />
            </div>
          </div>

          {/* LADO DIREITO: EDIÇÃO */}
          <div className="space-y-6 md:col-span-3">
            <h3 className="text-sm font-bold uppercase tracking-widest text-black/30">Personalização</h3>
            
            <section className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-black">Nome de Exibição</h2>
                <p className="text-sm text-black/40">Como você aparecerá nos agendamentos e logs.</p>
              </div>

              <form action={upsertAdminProfile} className="space-y-4">
                <div className="relative group">
                  <User className="absolute left-4 top-3.5 text-black/20 transition-colors group-focus-within:text-black" size={20} />
                  <input
                    name="display_name"
                    defaultValue={profile?.display_name ?? ""}
                    placeholder="Nome completo ou apelido"
                    className="w-full rounded-2xl border border-black/10 bg-black/2 py-3.5 pl-12 pr-4 text-sm font-medium outline-none transition-all focus:border-black focus:bg-white focus:ring-4 focus:ring-black/5"
                    required
                  />
                </div>
                
                <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-4 text-sm font-bold text-white transition hover:bg-gray-900 active:scale-[0.98]">
                  <Save size={18} />
                  Salvar Alterações
                </button>
              </form>
            </section>

            {/* CARD EXTRA: INFO DE SEGURANÇA */}
            <div className="rounded-3xl bg-blue-50 p-6 text-blue-800">
              <p className="flex items-center gap-2 text-sm font-bold">
                <ShieldCheck size={18} /> Sua conta está segura
              </p>
              <p className="mt-1 text-xs opacity-70">
                Apenas usuários autorizados no Supabase podem acessar este painel administrativo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SUBCOMPONENTES ---

function InfoCard({ label, value, icon: Icon, mono }: { label: string; value: string; icon: React.ComponentType<{ size?: number }>; mono?: boolean }) {
  return (
    <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm transition hover:border-black/20">
      <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-xl bg-black/5 text-black/30">
        <Icon size={16} />
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-black/30">{label}</p>
      <p className={`mt-1 truncate font-semibold text-black/80 ${mono ? "font-mono text-xs" : "text-sm"}`}>
        {value}
      </p>
    </div>
  );
}