"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";

function mustStr(v: FormDataEntryValue | null, field: string) {
  const s = String(v ?? "").trim();
  if (!s) throw new Error(`Campo obrigatório: ${field}`);
  return s;
}

function asBool(v: FormDataEntryValue | null) {
  // checkbox: "on" quando marcado, null quando não
  return v === "on";
}

function mustInt(v: FormDataEntryValue | null, field: string) {
  const s = mustStr(v, field);
  const n = Number(s);
  if (!Number.isInteger(n)) throw new Error(`Campo inválido: ${field}`);
  return n;
}

function mustTime(v: FormDataEntryValue | null, field: string) {
  const s = mustStr(v, field);
  if (!/^\d{2}:\d{2}$/.test(s)) throw new Error(`Formato de hora inválido: ${field}`);
  return s;
}

// --- BARBERS ---

export async function createBarber(formData: FormData) {
  const name = mustStr(formData.get("name"), "name");
  const active = asBool(formData.get("active"));

  const supabase = await createSupabaseServer();

  const { error } = await supabase.from("barbers").insert({
    name,
    active,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/barbeiros");
}

export async function updateBarber(formData: FormData) {
  const id = mustStr(formData.get("id"), "id");
  const name = mustStr(formData.get("name"), "name");
  const active = asBool(formData.get("active"));

  const supabase = await createSupabaseServer();

  const { error } = await supabase.from("barbers").update({ name, active }).eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/barbeiros");
}

export async function deleteBarber(formData: FormData) {
  const id = mustStr(formData.get("id"), "id");

  const supabase = await createSupabaseServer();

  // Vai falhar se tiver agendamento apontando pro barbeiro (FK sem cascade).
  // MVP: permitir deletar só se não existir appointment.
  const { error } = await supabase.from("barbers").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/barbeiros");
}

// --- SCHEDULES ---

export async function createSchedule(formData: FormData) {
  const barber_id = mustStr(formData.get("barber_id"), "barber_id");
  const day_of_week = mustInt(formData.get("day_of_week"), "day_of_week");
  const start_time = mustTime(formData.get("start_time"), "start_time");
  const end_time = mustTime(formData.get("end_time"), "end_time");

  if (day_of_week < 0 || day_of_week > 6) {
    throw new Error("Dia da semana inválido");
  }

  const supabase = await createSupabaseServer();

  const { error } = await supabase.from("barber_schedules").insert({
    barber_id,
    day_of_week,
    start_time,
    end_time,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/barbeiros");
}

export async function updateSchedule(formData: FormData) {
  const id = mustStr(formData.get("id"), "id");
  const day_of_week = mustInt(formData.get("day_of_week"), "day_of_week");
  const start_time = mustTime(formData.get("start_time"), "start_time");
  const end_time = mustTime(formData.get("end_time"), "end_time");

  if (day_of_week < 0 || day_of_week > 6) {
    throw new Error("Dia da semana inválido");
  }

  const supabase = await createSupabaseServer();

  const { error } = await supabase
    .from("barber_schedules")
    .update({ day_of_week, start_time, end_time })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/barbeiros");
}

export async function deleteSchedule(formData: FormData) {
  const id = mustStr(formData.get("id"), "id");
  const supabase = await createSupabaseServer();

  const { error } = await supabase.from("barber_schedules").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/barbeiros");
}