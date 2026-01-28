"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";

function mustStr(v: FormDataEntryValue | null, field: string) {
  const s = String(v ?? "").trim();
  if (!s) throw new Error(`Campo obrigatório: ${field}`);
  return s;
}

export async function createBarber(formData: FormData) {
  const name = mustStr(formData.get("name"), "name");

  const supabase = await createSupabaseServer();

  const { error } = await supabase.from("barbers").insert({
    name,
    active: true,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/barbeiros");
}

export async function updateBarber(formData: FormData) {
  const id = mustStr(formData.get("id"), "id");
  const name = mustStr(formData.get("name"), "name");

  const supabase = await createSupabaseServer();

  const { error } = await supabase.from("barbers").update({ name }).eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/barbeiros");
}

export async function setBarberActive(formData: FormData) {
  const id = mustStr(formData.get("id"), "id");
  const active = mustStr(formData.get("active"), "active") === "true";

  const supabase = await createSupabaseServer();

  const { error } = await supabase.from("barbers").update({ active }).eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/barbeiros");
}

export async function deleteBarber(formData: FormData) {
  const id = mustStr(formData.get("id"), "id");

  const supabase = await createSupabaseServer();

  // Observação: se existir FK (appointments, schedules), o delete pode falhar dependendo do ON DELETE.
  // No seu schema, schedules tem cascade; appointments tem cascade. Deve funcionar.
  const { error } = await supabase.from("barbers").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/barbeiros");
}