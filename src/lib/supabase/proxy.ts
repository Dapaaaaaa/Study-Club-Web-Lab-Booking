import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Halaman yang boleh diakses tanpa login
const PUBLIC_PATHS = ["/", "/login", "/signup"];
// Halaman yang tidak perlu dibuka lagi kalau sudah login
const GUEST_ONLY_PATHS = ["/login", "/signup"];

// Redirect sambil membawa cookie sesi terbaru (WAJIB, kalau tidak user ter-logout)
function redirectWithCookies(request: NextRequest, from: NextResponse, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";

  const response = NextResponse.redirect(url);
  from.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
  for (const header of ["cache-control", "expires", "pragma"]) {
    const value = from.headers.get(header);
    if (value) response.headers.set(header, value);
  }
  return response;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value),
          );
        },
      },
    },
  );

  // PENTING: pakai getClaims() (memverifikasi token), BUKAN getSession(), untuk melindungi halaman.
  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = !!data?.claims;
  const { pathname } = request.nextUrl;

  if (!isLoggedIn && !PUBLIC_PATHS.includes(pathname)) {
    return redirectWithCookies(request, supabaseResponse, "/login");
  }
  if (isLoggedIn && GUEST_ONLY_PATHS.includes(pathname)) {
    return redirectWithCookies(request, supabaseResponse, "/rooms");
  }

  return supabaseResponse;
}
