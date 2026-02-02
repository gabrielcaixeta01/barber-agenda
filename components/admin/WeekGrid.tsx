"use client";

import { useEffect, useMemo, useState } from "react";
import type { AdminWeekAppointment, AdminAppointmentStatus } from "@/types/admin";
import { setAppointmentStatus, updateAppointment } from "@/app/admin/agendamentos/actions";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function hhmm(t: string) {
  return String(t).slice(0, 5);
}

type WeekGridProps = {
  days: string[];
  dayLabels: string[];
  timeRows: string[];
  weekAppointments: AdminWeekAppointment[];
  barbers: Array<{ id: string; name: string }>;
  services: Array<{ id: string; name: string }>;
};

export default function WeekGrid({
  days,
  dayLabels,
  timeRows,
  weekAppointments,
  barbers,
  services,
}: WeekGridProps) {
  const [selected, setSelected] = useState<AdminWeekAppointment | null>(null);
  const [editTime, setEditTime] = useState("");
  const [editBarberId, setEditBarberId] = useState<string | "">("");

  useEffect(() => {
    if (!selected) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEditTime(hhmm(selected.appointment_time));
    setEditBarberId(selected.barber?.id ?? "");
  }, [selected]);

  const weekIndex = useMemo(() => {
    const index = new Map<string, Map<string, AdminWeekAppointment[]>>();
    for (const a of weekAppointments) {
      const d = a.appointment_date;
      const t = hhmm(a.appointment_time);
      if (!index.has(d)) index.set(d, new Map());
      const byTime = index.get(d)!;
      if (!byTime.has(t)) byTime.set(t, []);
      byTime.get(t)!.push(a);
    }
    return index;
  }, [weekAppointments]);

  const selectedService = services.find((s) => s.id === selected?.service?.id);
  const statusBadge = (status: AdminAppointmentStatus) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/10 text-emerald-700";
      case "completed":
        return "bg-blue-500/10 text-blue-700";
      case "cancelled":
      default:
        return "bg-red-500/10 text-red-700";
    }
  };

  return (
    <>
      <div className="overflow-auto">
        <div className="min-w-245">
          {/* Header row */}
          <div className="grid grid-cols-[100px_repeat(7,1fr)] border-b border-black/10">
            <div className="px-4 py-3 text-xs opacity-60">Hora</div>
            {days.map((d, idx) => (
              <div key={d} className="px-4 py-3 text-xs font-medium">
                {dayLabels[idx] ?? d}
              </div>
            ))}
          </div>

          {/* Body */}
          <div className="divide-y divide-black/10">
            {timeRows.map((t) => (
              <div key={t} className="grid grid-cols-[100px_repeat(7,1fr)]">
                <div className="px-4 py-3 text-xs opacity-60">{t}</div>

                {days.map((d) => {
                  const items = weekIndex.get(d)?.get(t) ?? [];
                  return (
                    <div key={`${d}-${t}`} className="px-2 py-2">
                      {items.length === 0 ? (
                        <div className="h-10 rounded-xl border border-black/5 bg-black/1" />
                      ) : (
                        <div className="space-y-2">
                          {items.map((a) => (
                            <button
                              key={a.id}
                              type="button"
                              onClick={() => setSelected(a)}
                              className="w-full rounded-xl border border-black/10 bg-white p-2 text-left text-xs transition hover:bg-black/5"
                              title={`${a.client_name} • ${a.service?.name ?? "Serviço"}`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="font-medium">{a.client_name}</div>
                                <span className={cx("rounded-full px-2 py-0.5 text-[10px]", statusBadge(a.status))}>
                                  {a.status === "active" ? "Ativo" : a.status === "completed" ? "Concluído" : "Cancelado"}
                                </span>
                              </div>
                              <div className="mt-0.5 opacity-70">
                                {a.service?.name ?? "Serviço"} • {a.barber?.name ?? "A definir"}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-black/10 bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs opacity-60">{selected.appointment_date} • {hhmm(selected.appointment_time)}</div>
                <h3 className="text-lg font-semibold">{selected.client_name}</h3>
                <div className="mt-1 text-sm opacity-70">
                  {selected.service?.name ?? "Serviço"} • {selected.barber?.name ?? "A definir"}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg border border-black/10 px-2 py-1 text-xs hover:bg-black/5"
              >
                Fechar
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <form action={setAppointmentStatus}>
                <input type="hidden" name="id" value={selected.id} />
                <input type="hidden" name="status" value="active" />
                <button
                  type="submit"
                  className="rounded-lg border border-black/10 px-3 py-2 text-xs hover:bg-black/5"
                >
                  Confirmar presença
                </button>
              </form>

              <form action={setAppointmentStatus}>
                <input type="hidden" name="id" value={selected.id} />
                <input type="hidden" name="status" value="completed" />
                <button
                  type="submit"
                  className="rounded-lg border border-black/10 px-3 py-2 text-xs hover:bg-black/5"
                >
                  Marcar concluído
                </button>
              </form>

              <form action={setAppointmentStatus}>
                <input type="hidden" name="id" value={selected.id} />
                <input type="hidden" name="status" value="cancelled" />
                <button
                  type="submit"
                  className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-700 hover:bg-red-500/20"
                >
                  Cancelar
                </button>
              </form>
            </div>

            <div className="mt-5 border-t border-black/10 pt-4">
              <h4 className="text-sm font-medium">Editar horário / barbeiro</h4>
              <form action={updateAppointment} className="mt-3 grid gap-3">
                <input type="hidden" name="id" value={selected.id} />
                <input type="hidden" name="appointment_date" value={selected.appointment_date} />
                <input type="hidden" name="service_id" value={selected.service?.id ?? selectedService?.id ?? ""} />

                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <label className="text-xs opacity-60">Horário</label>
                    <input
                      type="time"
                      name="appointment_time"
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                      className="mt-1 h-10 w-full rounded-xl border border-black/10 px-3 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs opacity-60">Barbeiro</label>
                    <select
                      name="barber_id"
                      value={editBarberId}
                      onChange={(e) => setEditBarberId(e.target.value)}
                      className="mt-1 h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-sm"
                    >
                      <option value="">A definir</option>
                      {barbers.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="h-10 rounded-xl bg-black px-4 text-sm text-white hover:opacity-90"
                >
                  Salvar alterações
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
