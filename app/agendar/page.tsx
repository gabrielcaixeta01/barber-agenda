"use client";

import { useEffect, useMemo, useState } from "react";
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

export default function SchedulePage() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [selectedBarberId, setSelectedBarberId] = useState<string>("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [date, setDate] = useState<string>(todayISO());
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>("");

  const selectedBarber = useMemo(
    () => barbers.find((b) => b.id === selectedBarberId) || null,
    [barbers, selectedBarberId]
  );

  const selectedService = useMemo(
    () => services.find((s) => s.id === selectedServiceId) || null,
    [services, selectedServiceId]
  );

  useEffect(() => {
    (async () => {
      const [b, s] = await Promise.all([getBarbers(), getServices()]);
      setBarbers(b);
      setServices(s);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setSelectedTime("");
      const data = await getAvailability({
        date,
        barberId: selectedBarberId || undefined,
      });
      setSlots(data);
    })();
  }, [date, selectedBarberId]);

  const canContinue = Boolean(selectedServiceId) && Boolean(date) && Boolean(selectedTime);

  async function handleSubmit(payload: { name: string; phone: string }) {
    if (!canContinue) return;

    const appointment: AppointmentCreate = {
        barber_id: selectedBarberId || null,
        service_id: selectedServiceId,
        appointment_date: date,
        appointment_time: selectedTime,
        client_name: payload.name,
        client_phone: payload.phone,
        };

    // HOJE: só log
    // DEPOIS: POST /api/appointments
    console.log("CREATE APPOINTMENT:", appointment);

    // WhatsApp link (depois você melhora com mensagem completa)
    const text = encodeURIComponent(
      `Agendamento confirmado!\nData: ${date}\nHora: ${selectedTime}\nServiço: ${
        selectedService?.name ?? ""
      }\nBarbeiro: ${selectedBarber?.name ?? "Qualquer disponível"}\nNome: ${payload.name}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Agendar horário</h1>
      <p className="mt-2 text-sm opacity-80">
        Escolha o serviço, o barbeiro (opcional) e um horário livre.
      </p>

      <div className="mt-8 space-y-6">
        <ServiceSelector
          services={services}
          value={selectedServiceId}
          onChange={setSelectedServiceId}
        />

        <BarberSelector
          barbers={barbers}
          value={selectedBarberId}
          onChange={setSelectedBarberId}
          allowAny
        />

        <DatePicker value={date} onChange={setDate} />

        <TimeSlots
          slots={slots}
          value={selectedTime}
          onChange={setSelectedTime}
          disabled={!selectedServiceId}
        />

        <BookingForm
          disabled={!canContinue}
          onSubmit={handleSubmit}
        />
      </div>
    </main>
  );
}