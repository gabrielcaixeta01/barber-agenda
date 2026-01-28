import { createSupabaseServer } from "@/lib/supabase/server";
import type { AdminAppointmentRow, AdminStats } from "@/types/admin";

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
  const supabase = await createSupabaseServer();

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
        .select("id", { count: "exact", head: true })
        .eq("active", true),
    ]);

  if (e1) throw e1;
  if (e2) throw e2;
  if (e3) throw e3;

  return {
    appointmentsToday: todayCount ?? 0,
    appointmentsWeek: weekCount ?? 0,
    activeBarbers: barbersCount ?? 0,
  };
}

export async function getTodayAppointments(): Promise<AdminAppointmentRow[]> {
  const supabase = await createSupabaseServer();
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