"use client";

import { useEffect, useMemo, useState } from "react";
import { Barber, Service, AppointmentCreate } from "@/types/booking";
import { getAvailability, getBarbers, getServices } from "@/lib/data/booking";
import { Check, Clock, User, Scissors, Calendar as CalendarIcon, Smartphone, Edit2, ArrowRight } from "lucide-react";
import { LucideIcon } from "lucide-react"; // Ensure this import is present


// Componentes
import BarberSelector from "@/components/booking/BarberSelector";
import ServiceSelector from "@/components/booking/ServiceSelector";
import DatePicker from "@/components/booking/DatePicker";
import TimeSlots from "@/components/booking/TimeSlots";
// Nota: Vamos criar o form de dados dentro do arquivo para ter controle total do estado (controlled inputs)

const cx = (...classes: unknown[]) => classes.filter(Boolean).join(" ");

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatDateBR(iso: string) {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export default function SchedulePage() {
  const [step, setStep] = useState(1);

  // Dados do Sistema
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [slots, setSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Dados do Formulário (Estado)
  const [selectedBarberId, setSelectedBarberId] = useState<string>("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [date, setDate] = useState<string>(todayISO());
  const [selectedTime, setSelectedTime] = useState<string>("");
  
  // Dados do Cliente (Agora controlados aqui para persistir)
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  // Status de Envio
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Memos
  const selectedBarber = useMemo(
    () => barbers.find((b) => b.id === selectedBarberId) || null,
    [barbers, selectedBarberId]
  );
  const selectedService = useMemo(
    () => services.find((s) => s.id === selectedServiceId) || null,
    [services, selectedServiceId]
  );

  // 1. Carga Inicial
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [b, s] = await Promise.all([getBarbers(), getServices()]);
        if (!alive) return;
        setBarbers(b);
        setServices(s);
      } catch (err) {
        console.error(err);
      }
    })();
    return () => { alive = false; };
  }, []);

  // 2. Carga de Horários
  useEffect(() => {
    let alive = true;
    (async () => {
      
      setPageError(null);
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
      } finally {
        if (!alive) return;
        setIsLoadingSlots(false);
      }
    })();
    return () => { alive = false; };
  }, [date, selectedBarberId]);

  // Submit Final
  async function handleFinalSubmit() {
    setPageError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const appointment: AppointmentCreate = {
      barber_id: selectedBarberId || null,
      service_id: selectedServiceId,
      appointment_date: date,
      appointment_time: selectedTime,
      client_name: clientName,
      client_phone: clientPhone,
    };

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointment),
      });
      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        setPageError(data?.error || "Erro ao criar agendamento.");
        return;
      }

      setSuccess(`Agendamento confirmado para ${formatDateBR(date)} às ${selectedTime}.`);
      
      // Reset Total após sucesso
      setSelectedBarberId("");
      setSelectedServiceId("");
      setDate(todayISO());
      setSelectedTime("");
      setClientName("");
      setClientPhone("");
      setStep(1);
      window.scrollTo({ top: 0, behavior: "smooth" });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setPageError("Erro de conexão. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Helpers de resumo
  const summary = useMemo(() => ({
      barber: selectedBarber?.name || "Qualquer disponível",
      service: selectedService?.name || "—",
      date: date ? formatDateBR(date) : "—",
      time: selectedTime || "—",
      price: selectedService?.price_cents 
        ? `R$ ${(selectedService.price_cents / 100).toFixed(2).replace(".", ",")}` 
        : "A consultar",
      duration: selectedService?.duration_minutes ? `${selectedService.duration_minutes} min` : ""
  }), [selectedBarber, selectedService, date, selectedTime]);

  const hasSelectedTime = !!selectedTime;
  const hasClientInfo = !!clientName || clientPhone.length >= 10;
  const isBarberStepCompleted = !!selectedServiceId && (!!selectedBarberId || hasSelectedTime || hasClientInfo);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 lg:py-20">
      <header className="mb-10 text-center md:text-left">
        <h1 className="text-2xl font-semibold tracking-tight text-black">Agendar Horário</h1>
        <p className="mt-2 text-lg font-light text-black/50">Preencha os passos abaixo para garantir seu corte.</p>
      </header>

      {/* TIMELINE PRINCIPAL */}
      <div className="space-y-0">
          
        {/* PASSO 1: SERVIÇO */}
        <StepContainer 
          number={1} 
          title="Serviço" 
          subTitle={selectedServiceId ? summary.service : undefined}
          isActive={step === 1} 
          isCompleted={!!selectedServiceId}
          onTitleClick={() => setStep(1)}
        >
          <ServiceSelector
            services={services}
            value={selectedServiceId}
            onChange={(v) => {
              setSelectedServiceId(v);
              // Avança automaticamente se for a primeira vez, mas não limpa nada
              if (step === 1) setStep(2);
            }}
          />
        </StepContainer>

        {/* PASSO 2: PROFISSIONAL */}
        <StepContainer 
          number={2} 
          title="Profissional"
          subTitle={selectedBarberId ? selectedBarber?.name : (isBarberStepCompleted ? "Qualquer disponível" : undefined)}
          isActive={step === 2} 
          isCompleted={isBarberStepCompleted}
          isDisabled={!selectedServiceId}
          onTitleClick={() => selectedServiceId && setStep(2)}
        >
          <BarberSelector
            barbers={barbers}
            value={selectedBarberId}
            onChange={(v) => {
              setSelectedBarberId(v);
              if (step === 2) setStep(3);
            }}
            allowAny
          />
        </StepContainer>

        {/* PASSO 3: DATA E HORA */}
        <StepContainer 
          number={3} 
          title="Data e Horário"
          subTitle={selectedTime ? `${summary.date} às ${summary.time}` : undefined} 
          isActive={step === 3} 
          isCompleted={!!selectedTime}
          isDisabled={!selectedServiceId}
          onTitleClick={() => selectedServiceId && setStep(3)}
        >
          <div className="space-y-6">
            <DatePicker value={date} onChange={setDate} />
            <div className="pt-4 border-t border-black/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Clock size={18} /> Horários disponíveis
                </h3>
                {isLoadingSlots && <span className="animate-pulse text-xs text-black/50">Atualizando...</span>}
              </div>
              <TimeSlots
                slots={slots}
                value={selectedTime}
                onChange={(v) => {
                  setSelectedTime(v);
                  if (step === 3) setStep(4);
                }}
                disabled={!selectedServiceId}
              />
            </div>
          </div>
        </StepContainer>

        {/* PASSO 4: SEUS DADOS (Novo comportamento) */}
        <StepContainer 
          number={4} 
          title="Seus Dados" 
          subTitle={clientName ? `${clientName} • ${clientPhone}` : undefined}
          isActive={step === 4} 
          isCompleted={!!clientName && clientPhone.length >= 10}
          isDisabled={!selectedTime}
          onTitleClick={() => selectedTime && setStep(4)}
        >
          <div className="rounded-2xl border border-black/10 bg-white p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-black/30" size={18} />
                  <input 
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ex: João Silva"
                    className="w-full rounded-xl border border-black/10 bg-transparent py-2.5 pl-10 pr-4 outline-none transition focus:border-black"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Celular / WhatsApp</label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-3 text-black/30" size={18} />
                  <input 
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="w-full rounded-xl border border-black/10 bg-transparent py-2.5 pl-10 pr-4 outline-none transition focus:border-black"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                disabled={!clientName || clientPhone.length < 10}
                onClick={() => setStep(5)}
                className="flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-black/80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Revisar agendamento <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </StepContainer>

        {/* PASSO 5: RESUMO E CONFIRMAÇÃO (Novo Passo) */}
        <StepContainer 
          number={5} 
          title="Resumo e Confirmação" 
          isActive={step === 5} 
          isCompleted={false}
          isDisabled={!clientName || clientPhone.length < 10}
          onTitleClick={() => clientName && setStep(5)}
        >
           <div className="overflow-hidden rounded-3xl border border-black/10 bg-white">
              {/* Header do Ticket */}
              <div className="bg-black p-6 text-white sm:flex sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-medium">Tudo certo?</h2>
                  <p className="text-sm font-light opacity-60">Confira os detalhes e confirme.</p>
                </div>
                <div className="mt-4 sm:mt-0">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-light text-white backdrop-blur-md">
                     Pagamento no local
                  </span>
                </div>
              </div>
              
              <div className="p-6 md:p-8">
                <div className="grid gap-6 md:grid-cols-2">
                  <SummaryRow label="Serviço" value={summary.service} icon={Scissors} />
                  <SummaryRow label="Profissional" value={summary.barber} icon={User} />
                  <SummaryRow label="Data" value={summary.date} icon={CalendarIcon} />
                  <SummaryRow label="Horário" value={summary.time} icon={Clock} />
                  <SummaryRow label="Cliente" value={clientName} icon={User} />
                  <SummaryRow label="Contato" value={clientPhone} icon={Smartphone} />
                </div>
                
                <div className="mt-8 border-t border-black/5 pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                        <p className="text-sm font-medium text-black/50">Valor total estimado</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-light tracking-tight">{summary.price}</span>
                            {summary.duration && <span className="text-sm text-black/40">({summary.duration})</span>}
                        </div>
                    </div>

                    <button
                        onClick={handleFinalSubmit}
                        disabled={isSubmitting}
                        className="rounded-xl bg-black px-8 py-4 text-base font-light text-white shadow-lg shadow-black/10 transition hover:scale-[1.02] hover:bg-gray-900 disabled:opacity-70 disabled:scale-100"
                    >
                        {isSubmitting ? "Confirmando..." : "Confirmar Agendamento"}
                    </button>
                </div>

                {/* Mensagens de Erro/Sucesso Inline */}
                {pageError && (
                    <div className="mt-6 rounded-xl bg-red-50 p-4 text-center text-sm text-red-600">
                        {pageError}
                    </div>
                )}
                {success && (
                    <div className="mt-6 rounded-xl bg-emerald-50 p-4 text-center text-sm font-medium text-emerald-800">
                        ✅ {success}
                    </div>
                )}
              </div>
           </div>
        </StepContainer>

      </div>
    </main>
  );
}

// --- COMPONENTES VISUAIS ---

interface StepContainerProps {
  number: number;
  title: string;
  subTitle?: string;
  children: React.ReactNode;
  isActive: boolean;
  isCompleted?: boolean;
  isDisabled?: boolean;
  onTitleClick?: () => void;
}

function StepContainer({ number, title, subTitle, children, isActive, isCompleted, isDisabled, onTitleClick }: StepContainerProps) {
  return (
    <div className={cx(
        "group relative pl-14 transition-all duration-500",
        isDisabled ? "opacity-40 grayscale" : "opacity-100"
    )}>
      {/* Linha Vertical */}
      <div className="absolute left-6.75 top-12 bottom-0 w-px bg-black/10 group-last:hidden" />
      
      {/* Botão circular do número */}
      <button 
        type="button"
        disabled={isDisabled}
        onClick={onTitleClick}
        className={cx(
          "absolute left-2 top-0 z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 font-light transition-all duration-300",
          isCompleted ? "bg-black border-black text-white hover:bg-black/80" : 
          isActive ? "bg-white border-black text-black scale-110 shadow-lg" : "bg-white border-black/10 text-black/30"
        )}
      >
        {isCompleted && !isActive ? <Check size={18} /> : number}
      </button>

      {/* Título Clicável */}
      <button 
        type="button"
        disabled={isDisabled}
        onClick={onTitleClick}
        className={cx(
            "flex flex-col items-start text-left w-full outline-none transition-all",
            isActive ? "mb-6" : "mb-2"
        )}
      >
        <span className={cx(
            "text-2xl font-light tracking-tight transition-colors flex items-center gap-3",
            isActive ? "text-black" : "text-black/40 hover:text-black/60",
        )}>
            {title}
            {isCompleted && !isActive && (
                <span className="text-xs font-light uppercase tracking-wider text-black/40 flex items-center gap-1 border border-black/10 rounded-full px-2 py-0.5 hover:bg-black/5 hover:text-black">
                    <Edit2 size={10} /> Editar
                </span>
            )}
        </span>
        
        {/* Subtitulo (o que foi escolhido) quando fechado */}
        {!isActive && subTitle && (
            <span className="text-sm font-light text-black/80 animate-in fade-in slide-in-from-top-1">
                {subTitle}
            </span>
        )}
      </button>
      
      {/* Conteúdo Expansível */}
      <div 
        className={cx(
            "grid transition-[grid-template-rows,opacity,padding] duration-500 ease-in-out",
            isActive ? "grid-rows-[1fr] opacity-100 mb-12" : "grid-rows-[0fr] opacity-0 mb-0"
        )}
      >
        <div className="overflow-hidden">
            <div className="py-1">
                {children}
            </div>
        </div>
      </div>
    </div>
  );
}


function SummaryRow({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-black/40">
                <Icon size={16} />
            </div>
            <div>
                <p className="text-[10px] font-medium uppercase tracking-widest text-black/30">{label}</p>
                <p className="text-base font-light text-black/90 leading-tight">{value}</p>
            </div>
        </div>
    )
}