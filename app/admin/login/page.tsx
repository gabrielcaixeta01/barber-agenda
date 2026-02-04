"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { loginAdmin } from "@/app/admin/actions";
import { Lock, Mail, ArrowRight, AlertCircle, Loader2, KeyRound } from "lucide-react";

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(formData: FormData) {
    setError(null); // Limpa erros anteriores ao tentar novamente
    const result = await loginAdmin(formData);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-4 py-12">
      <div className="w-full max-w-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Card Principal */}
        <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-xl shadow-black/3">
          
          {/* Cabeçalho com Ícone */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white shadow-lg shadow-black/20">
              <Lock size={24} strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-medium tracking-tight text-black">
              Admin
            </h1>
            <p className="mt-2 text-sm font-light text-black/50">
              Digite suas credenciais para acessar o painel.
            </p>
            <div className="mt-4 rounded-2xl border border-black/5 bg-black/2 px-4 py-3 text-xs text-black/60">
              <span className="font-semibold text-black/70">Acesso</span> usuário: admin@gmail.com • senha: 123456
            </div>
          </div>

          <form action={handleLogin} className="space-y-5">
            {/* Input Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-black/40 ml-1">
                E-mail
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-black/30 transition-colors group-focus-within:text-black" />
                <input
                  name="email"
                  type="email"
                  placeholder="admin@barbearia.com"
                  required
                  className="w-full rounded-2xl border border-black/10 bg-black/2 py-3.5 pl-12 pr-4 text-sm font-light outline-none transition-all placeholder:text-black/20 focus:border-black focus:bg-white focus:ring-4 focus:ring-black/5"
                />
              </div>
            </div>

            {/* Input Senha */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-black/40 ml-1">
                Senha
              </label>
              <div className="relative group">
                <KeyRound className="absolute left-4 top-3.5 h-5 w-5 text-black/30 transition-colors group-focus-within:text-black" />
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="w-full rounded-2xl border border-black/10 bg-black/2 py-3.5 pl-12 pr-4 text-sm font-medium outline-none transition-all placeholder:text-black/20 focus:border-black focus:bg-white focus:ring-4 focus:ring-black/5"
                />
              </div>
            </div>

            {/* Mensagem de Erro */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600 animate-in fade-in slide-in-from-top-1">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Botão de Submit (Componente Separado para Loading) */}
            <SubmitButton />
          </form>
        </div>
      </div>
    </main>
  );
}

// Componente isolado para acessar o status do formulário
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="group relative w-full overflow-hidden rounded-2xl bg-black py-4 text-sm font-light text-white transition-all hover:bg-gray-900 hover:shadow-lg hover:shadow-black/20 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      <div className="flex items-center justify-center gap-2">
        {pending ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Entrando...</span>
          </>
        ) : (
          <>
            <span>Acessar Painel</span>
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </>
        )}
      </div>
    </button>
  );
}