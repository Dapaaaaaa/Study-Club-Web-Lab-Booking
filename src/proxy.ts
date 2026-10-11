import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Next.js 16: file ini bernama proxy.ts (dulu middleware.ts).
// Dijalankan sebelum halaman dibuka: me-refresh sesi login & menjaga halaman privat.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Semua path kecuali file statis (_next/static, _next/image, favicon, gambar)
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
