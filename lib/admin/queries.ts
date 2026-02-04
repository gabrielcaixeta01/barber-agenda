import { createSupabaseAdminServer } from "@/lib/supabase/server";
import type {
  AdminAppointmentRow,
  AdminAppointmentStatus,
  AdminStats,
  AdminWeekAppointment,
} from "@/types/admin";

function toISODateSP(date = new Date()) {
  // Como você usa appointment_date (DATE), o importante é gerar YYYY-MM-DD corretamente.
  // Isso usa o horário local do servidor; na Vercel pode ser UTC.
  // Para MVP, ok. Se quiser 100% SP, eu te mando versão com Intl + timezone.
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function addDaysISO(isoDate: string, days: number) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return toISODateSP(dt);
}

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createSupabaseAdminServer();

  const today = toISODateSP(new Date());
  const weekEnd = addDaysISO(today, 6);

  const [{ count: todayCount, error: e1 }, { count: weekCount, error: e2 }, { count: barbersCount, error: e3 }] =
    await Promise.all([
      supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .eq("appointment_date", today)
        .eq("status", "active"),

      supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .gte("appointment_date", today)
        .lte("appointment_date", weekEnd)
        .eq("status", "active"),

      supabase
        .from("barbers")
        .select("id", { count: "exact", head: true }),
    ]);

  if (e1) throw e1;
  if (e2) throw e2;
  if (e3) throw e3;

  return {
    appointmentsToday: todayCount ?? 0,
    appointmentsWeek: weekCount ?? 0,
    totalBarbers: barbersCount ?? 0,
  };
}

export async function getTodayAppointments(): Promise<AdminAppointmentRow[]> {
  const supabase = await createSupabaseAdminServer();
  const today = toISODateSP(new Date());

  const { data, error } = await supabase
    .from("appointments")
    .select(
      `
      id,
      appointment_date,
      appointment_time,
      status,
      client_name,
      client_phone,
      barber:barbers ( id, name ),
      service:services ( id, name )
    `
    )
    .eq("appointment_date", today)
    .order("appointment_time", { ascending: true });

  if (error) throw error;

  // O supabase pode retornar barber/service como objeto ou null, já está compatível com o type.
  return (data ?? []) as unknown as AdminAppointmentRow[];
}

export type WeekAppointmentsFilters = {
  barberId?: string;
  serviceId?: string;
  status?: AdminAppointmentStatus;
};

export async function getWeekAppointments(params: {
  weekStartISO: string;
  weekEndISO: string;
  filters?: WeekAppointmentsFilters;
}): Promise<AdminWeekAppointment[]> {
  const supabase = await createSupabaseAdminServer();
  const { weekStartISO, weekEndISO, filters } = params;

  let q = supabase
    .from("appointments")
    .select(
      `
      id,
      appointment_date,
      appointment_time,
      status,
      client_name,
      client_phone,
      barber:barbers ( id, name ),
      service:services ( id, name, price_cents, duration_minutes )
    `
    )
    .gte("appointment_date", weekStartISO)
    .lte("appointment_date", weekEndISO);

  if (filters?.barberId) q = q.eq("barber_id", filters.barberId);
  if (filters?.serviceId) q = q.eq("service_id", filters.serviceId);
  if (filters?.status) q = q.eq("status", filters.status);

  const { data, error } = await q
    .order("appointment_date", { ascending: true })
    .order("appointment_time", { ascending: true });

  if (error) throw error;

  // O supabase pode retornar barber/service como objeto ou null, já está compatível com o type.
  return (data ?? []) as unknown as AdminWeekAppointment[];
}

export async function getWeekSummary() {
  const today = toISODateSP(new Date());
  const weekEnd = addDaysISO(today, 6);
  const appointments = await getWeekAppointments({
    weekStartISO: today,
    weekEndISO: weekEnd,
  });
  const totalAppointments = appointments.length;

  const serviceCountMap: Record<string, number> = {};
  appointments.forEach((appt) => {
    const serviceName = appt.service?.name || "Serviço desconhecido";
    if (!serviceCountMap[serviceName]) {
      serviceCountMap[serviceName] = 0;
    }
    serviceCountMap[serviceName]++;
  });

  const servicesSummary = Object.entries(serviceCountMap).map(([name, count]) => ({
    name,
    count,
  }));

  return {
    totalAppointments,
    servicesSummary,
  };
}

export async function getAdminBarbers() {
  const supabase = await createSupabaseAdminServer();
  const { data, error } = await supabase
    .from("barbers")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getAdminServices() {
  const supabase = await createSupabaseAdminServer();
  const { data, error } = await supabase
    .from("services")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}