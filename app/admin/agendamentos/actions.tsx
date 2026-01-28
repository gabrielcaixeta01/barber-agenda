"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

function mustStr(v: FormDataEntryValue | null, field: string) {
  const s = String(v ?? "").trim();
  if (!s) throw new Error(`Campo obrigatório: ${field}`);
  return s;
}

function optionalStr(v: FormDataEntryValue | null) {
  const s = String(v ?? "").trim();
  return s ? s : null;
}

function mustTime(v: FormDataEntryValue | null, field: string) {
  const s = mustStr(v, field);
  if (!/^\d{2}:\d{2}$/.test(s)) throw new Error(`Formato de hora inválido: ${field}`);
  return s;
}

function mustDate(v: FormDataEntryValue | null, field: string) {
  const s = mustStr(v, field);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) throw new Error(`Formato de data inválido: ${field}`);
  return s;
}

export async function setAppointmentsFilter(formData: FormData) {
  const date = String(formData.get("date") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();

  const params = new URLSearchParams();
  if (date) params.set("date", date);
  if (status) params.set("status", status);

  const qs = params.toString();
  redirect(qs ? `/admin/agendamentos?${qs}` : "/admin/agendamentos");
}

export async function cancelAppointment(formData: FormData) {
  const id = mustStr(formData.get("id"), "id");
  const supabase = await createSupabaseServer();

  const { error } = await supabase
    .from("appointments")
    .update({ status: "cancelled" })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/agendamentos");
}

export async function reactivateAppointment(formData: FormData) {
  const id = mustStr(formData.get("id"), "id");
  const supabase = await createSupabaseServer();

  const { error } = await supabase
    .from("appointments")
    .update({ status: "active" })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/agendamentos");
}

export async function updateAppointment(formData: FormData) {
  const id = mustStr(formData.get("id"), "id");

  const appointment_date = mustDate(formData.get("appointment_date"), "appointment_date");
  const appointment_time = mustTime(formData.get("appointment_time"), "appointment_time");
  const service_id = mustStr(formData.get("service_id"), "service_id");

  // barbeiro pode ser vazio (a definir)
  const barber_id = optionalStr(formData.get("barber_id"));

  const supabase = await createSupabaseServer();

  const { error } = await supabase
    .from("appointments")
    .update({
      appointment_date,
      appointment_time,
      service_id,
      barber_id,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/agendamentos");
}

export async function deleteAppointment(formData: FormData) {
  const id = mustStr(formData.get("id"), "id");
  const supabase = await createSupabaseServer();

  const { error } = await supabase.from("appointments").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/agendamentos");
}