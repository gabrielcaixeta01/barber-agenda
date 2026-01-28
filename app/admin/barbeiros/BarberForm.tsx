"use client";

import { useState, useTransition } from "react";
import { createBarber, updateBarber, setBarberActive, deleteBarber } from "./actions";

export function CreateBarberForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const formData = new FormData(e.currentTarget);
      const result = await createBarber(formData);

      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        // Limpa o formulário
        e.currentTarget.reset();
        
        // Remove mensagem de sucesso após 3s
        setTimeout(() => setSuccess(false), 3000);
      }
    });
  }

  return (
    <div>
      <form onSubmit={handleSubmit} data-create-barber className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          name="name"
          placeholder="Nome do barbeiro"
          required
          disabled={isPending}
          className="h-11 flex-1 rounded-xl border border-black/10 px-4 disabled:opacity-50"
        />
        <button disabled={isPending} className="h-11 rounded-xl bg-black px-5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50">
          {isPending ? "Criando..." : "Criar"}
        </button>
      </form>

      {error && (
        <div className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-3 rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-600">
          Barbeiro criado com sucesso!
        </div>
      )}
    </div>
  );
}

export function EditBarberForm({ id, name }: { id: string; name: string }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const formData = new FormData(e.currentTarget);
      const result = await updateBarber(formData);

      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        
        // Remove mensagem de sucesso após 2s e fecha o details
        setTimeout(() => {
          setSuccess(false);
          const details = document.querySelector<HTMLDetailsElement>(`details[data-edit-${id}]`);
          if (details) details.open = false;
        }, 2000);
      }
    });
  }

  return (
    <div className="mt-2 rounded-2xl border border-black/10 bg-white p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input type="hidden" name="id" value={id} />
        <input
          name="name"
          defaultValue={name}
          required
          disabled={isPending}
          className="h-11 flex-1 rounded-xl border border-black/10 px-4 disabled:opacity-50"
        />
        <button disabled={isPending} className="h-11 rounded-xl bg-black px-5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50">
          {isPending ? "Salvando..." : "Salvar"}
        </button>
      </form>

      {error && (
        <div className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-3 rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-600">
          Salvo com sucesso!
        </div>
      )}
    </div>
  );
}

export function BarberActionButtons({
  id,
  name,
  active,
}: {
  id: string;
  name: string;
  active: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  async function handleToggleActive(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      const formData = new FormData(e.currentTarget);
      await setBarberActive(formData);
    });
  }

  async function handleDelete(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!confirm(`Tem certeza que deseja excluir "${name}"?`)) {
      return;
    }
    startTransition(async () => {
      const formData = new FormData(e.currentTarget);
      await deleteBarber(formData);
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {/* Toggle active */}
      <form onSubmit={handleToggleActive}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="active" value={String(!active)} />
        <button
          disabled={isPending}
          className="rounded-xl border border-black/10 px-4 py-2 text-sm transition hover:border-black/30 disabled:opacity-50"
          type="submit"
        >
          {active ? "Desativar" : "Ativar"}
        </button>
      </form>

      {/* Edit inline */}
      <details className="group" data-edit={id}>
        <summary className="cursor-pointer list-none rounded-xl border border-black/10 px-4 py-2 text-sm transition hover:border-black/30">
          Editar
        </summary>

        <EditBarberForm id={id} name={name} />
      </details>

      {/* Delete */}
      <form onSubmit={handleDelete}>
        <input type="hidden" name="id" value={id} />
        <button
          disabled={isPending}
          className="rounded-xl border border-black/10 px-4 py-2 text-sm text-red-600 transition hover:border-red-600/40 disabled:opacity-50"
          type="submit"
        >
          Excluir
        </button>
      </form>
    </div>
  );
}
