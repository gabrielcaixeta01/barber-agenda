"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminServer } from "@/lib/supabase/server";

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

/**
 * Aceita:
 * "35" -> 3500
 * "35,00" -> 3500
 * "35.00" -> 3500
 * "1.234,56" -> 123456
 * "1,234.56" -> 123456
 */
function mustPriceCents(v: FormDataEntryValue | null, field: string) {
  const raw = String(v ?? "").trim();
  if (!raw) throw new Error(`Campo obrigatório: ${field}`);

  // Mantém apenas dígitos e separadores
  const cleaned = raw.replace(/[^\d.,]/g, "");
  if (!cleaned) throw new Error(`Campo inválido: ${field}`);

  // Heurística:
  // Se tiver vírgula, assume vírgula como decimal (pt-BR)
  // Senão, se tiver ponto, assume ponto como decimal
  // Remove separadores de milhar
  let normalized = cleaned;

  if (cleaned.includes(",")) {
    // remove pontos de milhar
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else {
    // remove vírgulas de milhar (caso "1,234.56")
    normalized = cleaned.replace(/,/g, "");
  }

  const num = Number(normalized);
  if (!Number.isFinite(num) || num < 0) throw new Error(`Campo inválido: ${field}`);

  const cents = Math.round(num * 100);
  if (!Number.isInteger(cents)) throw new Error(`Campo inválido: ${field}`);

  return cents;
}

export async function createService(formData: FormData) {
  const name = mustStr(formData.get("name"), "name");
  const duration_minutes = mustInt(formData.get("duration_minutes"), "duration_minutes");
  const price_cents = mustPriceCents(formData.get("price"), "price");

  const supabase = await createSupabaseAdminServer();

  const { error } = await supabase.from("services").insert({
    name,
    duration_minutes,
    price_cents,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/servicos");
}

export async function updateService(formData: FormData) {
  const id = mustStr(formData.get("id"), "id");
  const name = mustStr(formData.get("name"), "name");
  const duration_minutes = mustInt(formData.get("duration_minutes"), "duration_minutes");
  const price_cents = mustPriceCents(formData.get("price"), "price");

  const supabase = await createSupabaseAdminServer();

  const { error } = await supabase
    .from("services")
    .update({ name, duration_minutes, price_cents })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/servicos");
}

export async function deleteService(formData: FormData) {
  const id = mustStr(formData.get("id"), "id");

  const supabase = await createSupabaseAdminServer();

  const { error } = await supabase.from("services").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/servicos");
}