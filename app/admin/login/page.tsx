"use client";

import { useState } from "react";
import { loginAdmin } from "@/app/admin/actions";

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);

  async function action(formData: FormData) {
    const result = await loginAdmin(formData);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fafafa] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-black/10 bg-white p-6">
        <h1 className="text-xl font-semibold">Área administrativa</h1>
        <p className="mt-1 text-sm opacity-70">
          Acesso restrito à barbearia
        </p>

        <form action={action} className="mt-6 space-y-4">
          <input
            name="email"
            type="email"
            placeholder="E-mail"
            required
            className="w-full rounded-xl border border-black/10 px-4 py-3"
          />

          <input
            name="password"
            type="password"
            placeholder="Senha"
            required
            className="w-full rounded-xl border border-black/10 px-4 py-3"
          />

          {error && (
            <div className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-black px-4 py-3 text-white transition hover:opacity-90"
          >
            Entrar
          </button>
        </form>
      </div>
    </main>
  );
}