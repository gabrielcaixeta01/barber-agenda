import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing env: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  if (!url.startsWith("https://") || !url.includes(".supabase.co")) {
    throw new Error(`Invalid NEXT_PUBLIC_SUPABASE_URL: "${url}"`);
  }

  return createBrowserClient(url, key);
}