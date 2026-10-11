import { createBrowserClient } from "@supabase/ssr";

// Klien untuk Client Component (jalan di browser).
// Starter ini BELUM memakainya (semua akses data lewat server).
// Dipakai nanti kalau butuh fitur seperti realtime subscription.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
