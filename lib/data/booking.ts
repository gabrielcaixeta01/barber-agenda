import { createSupabaseClient } from "@/lib/supabase/client";
import { Barber, Service } from "@/types/booking";

export async function getBarbers(): Promise<Barber[]> {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("barbers")
    .select("id, name")
    .order("name");

  if (error) throw error;
  return data ?? [];
}

export async function getServices(): Promise<Service[]> {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("services")
    .select("id, name, duration_minutes, price_cents")
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getAvailability(params: {
  date: string;
  barberId?: string;
}): Promise<string[]> {
  const start = "09:00";
  const end = "19:00";
  const stepMin = 30;

  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);

  let minutes = (sh ?? 0) * 60 + (sm ?? 0);
  const endMin = (eh ?? 0) * 60 + (em ?? 0);

  const slots: string[] = [];
  while (minutes <= endMin) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    minutes += stepMin;
  }

  return slots;
}