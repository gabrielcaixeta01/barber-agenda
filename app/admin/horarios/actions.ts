"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

function mustStr(v: FormDataEntryValue | null, field: string) {
  const s = String(v ?? "").trim();
  if (!s) throw new Error(`Campo obrigatório: ${field}`);
  return s;
}

function mustInt(v: FormDataEntryValue | null, field: string) {
  const n = Number(String(v ?? "").trim());
  if (!Number.isInteger(n)) throw new Error(`Campo inválido: ${field}`);
  return n;
}

function mustTime(v: FormDataEntryValue | null, field: string) {
  const s = mustStr(v, field);
  // input type="time" costuma vir como "HH:MM"
  if (!/^\d{2}:\d{2}$/.test(s)) throw new Error(`Formato de hora inválido: ${field}`);
  return s;
}

export async function createSchedule(formData: FormData) {
  const barber_id = mustStr(formData.get("barber_id"), "barber_id");
  const day_of_week = mustInt(formData.get("day_of_week"), "day_of_week");
  const start_time = mustTime(formData.get("start_time"), "start_time");
  const end_time = mustTime(formData.get("end_time"), "end_time");

  if (day_of_week < 0 || day_of_week > 6) throw new Error("day_of_week fora do intervalo (0..6)");
  if (start_time >= end_time) throw new Error("start_time deve ser menor que end_time");

  const supabase = await createSupabaseServer();

  const { error } = await supabase.from("barber_schedules").insert({
    barber_id,
    day_of_week,
    start_time,
    end_time,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/horarios");
}

export async function updateSchedule(formData: FormData) {
  const id = mustStr(formData.get("id"), "id");
  const day_of_week = mustInt(formData.get("day_of_week"), "day_of_week");
  const start_time = mustTime(formData.get("start_time"), "start_time");
  const end_time = mustTime(formData.get("end_time"), "end_time");

  if (day_of_week < 0 || day_of_week > 6) throw new Error("day_of_week fora do intervalo (0..6)");
  if (start_time >= end_time) throw new Error("start_time deve ser menor que end_time");

  const supabase = await createSupabaseServer();

  const { error } = await supabase
    .from("barber_schedules")
    .update({ day_of_week, start_time, end_time })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/horarios");
}

export async function deleteSchedule(formData: FormData) {
  const id = mustStr(formData.get("id"), "id");

  const supabase = await createSupabaseServer();

  const { error } = await supabase
    .from("barber_schedules")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/horarios");
}

export async function setBarberFilter(formData: FormData) {
  const barber_id = String(formData.get("barber_id") ?? "").trim();

  if (barber_id) {
    redirect(`/admin/horarios?barber=${encodeURIComponent(barber_id)}`);
  } else {
    redirect("/admin/horarios");
  }
}