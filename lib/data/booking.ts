import { createSupabaseClient } from "@/lib/supabase/client";
import { Barber, Service } from "@/types/booking";

export async function getBarbers(): Promise<Barber[]> {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("barbers")
    .select("id, name, active")
    .eq("active", true)
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
  return ["09:00", "09:30", "10:00", "10:30", "14:00", "14:30"];
}