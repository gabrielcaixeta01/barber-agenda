"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";

function mustStr(v: FormDataEntryValue | null, field: string) {
  const s = String(v ?? "").trim();
  if (!s) throw new Error(`Campo obrigatório: ${field}`);
  return s;
}

function mustInt(v: FormDataEntryValue | null, field: string) {
  const n = Number(String(v ?? "").trim());
  if (!Number.isInteger(n) || n <= 0) throw new Error(`Campo inválido: ${field}`);
  return n;
}

export async function createService(formData: FormData) {
  const name = mustStr(formData.get("name"), "name");
  const duration_minutes = mustInt(formData.get("duration_minutes"), "duration_minutes");

  const supabase = await createSupabaseServer();

  const { error } = await supabase.from("services").insert({
    name,
    duration_minutes,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/servicos");
}

export async function updateService(formData: FormData) {
  const id = mustStr(formData.get("id"), "id");
  const name = mustStr(formData.get("name"), "name");
  const duration_minutes = mustInt(formData.get("duration_minutes"), "duration_minutes");

  const supabase = await createSupabaseServer();

  const { error } = await supabase
    .from("services")
    .update({ name, duration_minutes })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/servicos");
}

export async function deleteService(formData: FormData) {
  const id = mustStr(formData.get("id"), "id");

  const supabase = await createSupabaseServer();

  // Se houver appointments referenciando service_id, o delete pode falhar se não tiver cascade.
  // No seu schema atual, appointments -> services não tem cascade (somente references).
  // Em MVP, você pode:
  // 1) proibir excluir serviço usado, ou
  // 2) adicionar regra no banco.
  const { error } = await supabase.from("services").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/servicos");
}