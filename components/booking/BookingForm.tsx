import { useState } from "react";

export default function BookingForm({
  disabled,
  onSubmit,
}: {
  disabled: boolean;
  onSubmit: (data: { name: string; phone: string }) => Promise<void> | void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <section className="rounded-2xl border border-black/10 p-5">
      <h2 className="text-lg font-medium">Seus dados</h2>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-xl border border-black/10 px-4 py-3"
        />
        <input
          placeholder="Telefone (WhatsApp)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="rounded-xl border border-black/10 px-4 py-3"
        />
      </div>

      <button
        type="button"
        disabled={disabled || !name || !phone}
        onClick={() => onSubmit({ name, phone })}
        className={[
          "mt-4 w-full rounded-xl px-4 py-3 font-medium transition",
          disabled || !name || !phone
            ? "cursor-not-allowed bg-black/10 text-black/40"
            : "bg-black text-white hover:opacity-90",
        ].join(" ")}
      >
        Confirmar agendamento
      </button>
    </section>
  );
}