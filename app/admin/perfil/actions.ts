"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";

function mustStr(v: FormDataEntryValue | null, field: string) {
  const s = String(v ?? "").trim();
  if (!s) throw new Error(`Campo obrigatório: ${field}`);
  return s;
}

export async function upsertAdminProfile(formData: FormData) {
  const display_name = mustStr(formData.get("display_name"), "display_name");
  const supabase =  await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Não autenticado.");

  const { error } = await supabase.from("admin_profiles").upsert({
    id: user.id,
    display_name,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/perfil");
}