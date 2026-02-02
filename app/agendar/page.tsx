"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Barber, Service, AppointmentCreate } from "@/types/booking";
import { getAvailability, getBarbers, getServices } from "@/lib/data/booking";

import BarberSelector from "@/components/booking/BarberSelector";
import ServiceSelector from "@/components/booking/ServiceSelector";
import DatePicker from "@/components/booking/DatePicker";
import TimeSlots from "@/components/booking/TimeSlots";
import BookingForm from "@/components/booking/BookingForm";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatDateBR(iso: string) {
  // iso: yyyy-mm-dd
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export default function SchedulePage() {
  const formRef = useRef<HTMLDivElement>(null);

  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [selectedBarberId, setSelectedBarberId] = useState<string>("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [date, setDate] = useState<string>(todayISO());
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>("");

  const [isLoadingBase, setIsLoadingBase] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedBarber = useMemo(
    () => barbers.find((b) => b.id === selectedBarberId) || null,
    [barbers, selectedBarberId]
  );

  const selectedService = useMemo(
    () => services.find((s) => s.id === selectedServiceId) || null,
    [services, selectedServiceId]
  );

  // Carrega barbers + services
  useEffect(() => {
    let alive = true;

    (async () => {
      setIsLoadingBase(true);
      setPageError(null);

      try {
        const [b, s] = await Promise.all([getBarbers(), getServices()]);
        if (!alive) return;
        setBarbers(b);
        setServices(s);
      } catch (err) {
        console.error(err);
        if (!alive) return;
        setPageError("Não foi possível carregar os dados. Tente recarregar a página.");
      } finally {
        if (!alive) return;
        setIsLoadingBase(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // Carrega horários disponíveis
  useEffect(() => {
    let alive = true;

    (async () => {
      setSuccess(null);
      setPageError(null);
      setSelectedTime("");
      setIsLoadingSlots(true);

      try {
        const data = await getAvailability({
          date,
          barberId: selectedBarberId || undefined,
        });

        if (!alive) return;
        setSlots(data);
      } catch (err) {
        console.error(err);
        if (!alive) return;
        setSlots([]);
        setPageError("Não foi possível carregar os horários. Tente novamente.");
      } finally {
        if (!alive) return;
        setIsLoadingSlots(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [date, selectedBarberId]);

  const canContinue =
    Boolean(selectedServiceId) && Boolean(date) && Boolean(selectedTime);

  // Quando escolhe horário, desce pro formulário (conversão)
  useEffect(() => {
    if (!selectedTime) return;
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selectedTime]);

  async function handleSubmit(payload: { name: string; phone: string }) {
    setPageError(null);
    setSuccess(null);

    if (!canContinue || isSubmitting) return;

    const appointment: AppointmentCreate = {
      barber_id: selectedBarberId || null,
      service_id: selectedServiceId,
      appointment_date: date,
      appointment_time: selectedTime,
      client_name: payload.name,
      client_phone: payload.phone,
    };

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointment),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setPageError(data?.error || "Erro ao criar agendamento. Tente novamente.");
        return;
      }

      setSuccess(
        `Agendamento confirmado para ${formatDateBR(date)} às ${selectedTime}.`
      );

      // Reset (mantive seu comportamento)
      setSelectedBarberId("");
      setSelectedServiceId("");
      setDate(todayISO());
      setSelectedTime("");
    } catch (error) {
      console.error("❌ Erro ao criar agendamento:", error);
      setPageError("Erro ao criar agendamento. Verifique sua conexão e tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const summary = useMemo(() => {
    const barberLabel = selectedBarber?.name || "Qualquer disponível";
    const serviceLabel = selectedService?.name || "—";
    const dateLabel = date ? formatDateBR(date) : "—";
    const timeLabel = selectedTime || "—";
    const durationLabel =
      selectedService?.duration_minutes ? `${selectedService.duration_minutes} min` : null;
    const priceLabel =
      selectedService?.price_cents
        ? `R$ ${(selectedService.price_cents / 100).toFixed(2).replace(".", ",")}`
        : null;

    return {
      barberLabel,
      serviceLabel,
      dateLabel,
      timeLabel,
      durationLabel,
      priceLabel,
    };
  }, [selectedBarber, selectedService, date, selectedTime]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Agendar horário</h1>
          <p className="mt-2 text-sm opacity-80">
            Escolha o serviço, o barbeiro (opcional) e um horário livre.
          </p>
        </div>

        <div className="mt-4 sm:mt-0">
          <span className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-1 text-xs opacity-80">
            Pagamento presencial
          </span>
        </div>
      </div>

      {/* Alerts */}
      {pageError && (
        <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm">
          <div className="font-medium">Algo deu errado</div>
          <div className="mt-1 opacity-80">{pageError}</div>
        </div>
      )}

      {success && (
        <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm">
          <div className="font-medium">Pronto ✅</div>
          <div className="mt-1 opacity-80">{success}</div>
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* LEFT */}
        <div className="space-y-6">
          {/* Loading base */}
          {isLoadingBase ? (
            <div className="rounded-2xl border border-black/10 p-6">
              <div className="h-4 w-40 animate-pulse rounded bg-black/10" />
              <div className="mt-4 h-10 w-full animate-pulse rounded bg-black/5" />
              <div className="mt-3 h-10 w-full animate-pulse rounded bg-black/5" />
              <div className="mt-3 h-10 w-3/4 animate-pulse rounded bg-black/5" />
            </div>
          ) : (
            <>
              <ServiceSelector
                services={services}
                value={selectedServiceId}
                onChange={(v) => {
                  setSuccess(null);
                  setSelectedServiceId(v);
                }}
              />

              <BarberSelector
                barbers={barbers}
                value={selectedBarberId}
                onChange={(v) => {
                  setSuccess(null);
                  setSelectedBarberId(v);
                }}
                allowAny
              />

              <DatePicker
                value={date}
                onChange={(v) => {
                  setSuccess(null);
                  setDate(v);
                }}
              />

              <div className="rounded-2xl border border-black/10 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-medium">Horários</h2>
                    <p className="mt-1 text-sm opacity-70">
                      {selectedServiceId
                        ? "Selecione um horário disponível."
                        : "Selecione um serviço para ver os horários."}
                    </p>
                  </div>

                  {isLoadingSlots && (
                    <span className="text-xs opacity-60">Carregando…</span>
                  )}
                </div>

                <div className="mt-4">
                  <TimeSlots
                    slots={slots}
                    value={selectedTime}
                    onChange={(v) => {
                      setSuccess(null);
                      setSelectedTime(v);
                    }}
                    disabled={!selectedServiceId || isSubmitting}
                  />

                  {!isLoadingSlots && selectedServiceId && slots.length === 0 && (
                    <div className="mt-4 rounded-xl border border-black/10 p-4 text-sm opacity-80">
                      Nenhum horário disponível para essa data.
                      <span className="ml-1 opacity-60">
                        Tente outro dia ou selecione outro barbeiro.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div ref={formRef}>
                <div className="rounded-2xl border border-black/10 p-4 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-base font-medium">Seus dados</h2>
                      <p className="mt-1 text-sm opacity-70">
                        Só precisamos do básico para confirmar seu horário.
                      </p>
                    </div>

                    {isSubmitting && (
                      <span className="text-xs opacity-60">Confirmando…</span>
                    )}
                  </div>

                  <div className="mt-4">
                    <BookingForm
                      disabled={!canContinue || isSubmitting}
                      onSubmit={handleSubmit}
                    />
                  </div>

                  <p className="mt-4 text-xs opacity-60">
                    Ao confirmar, você reserva o horário selecionado.
                    Cancelamentos até 2h antes.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* RIGHT: Summary */}
        <aside className="lg:sticky lg:top-24">
          <div className="rounded-2xl border border-black/10 p-6">
            <h2 className="text-base font-medium">Resumo</h2>

            <div className="mt-4 space-y-3 text-sm">
              <Row label="Serviço" value={summary.serviceLabel} />
              <Row
                label="Duração"
                value={summary.durationLabel || "—"}
              />
              <Row label="Barbeiro" value={summary.barberLabel} />
              <Row label="Data" value={summary.dateLabel} />
              <Row label="Horário" value={summary.timeLabel} />
              {summary.priceLabel && <Row label="Valor" value={summary.priceLabel} />}
            </div>

            <div className="mt-6 rounded-xl border border-black/10 bg-black/2 p-4 text-xs opacity-80">
              Dica: se você não escolher um barbeiro, a barbearia seleciona{" "}
              <span className="font-medium">o melhor disponível</span> no horário.
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="opacity-60">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}