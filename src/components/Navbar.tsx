import Link from "next/link";
import { logout } from "@/actions/auth";
import { APP_NAME } from "@/lib/config";
import { getProfile } from "@/lib/auth";

export async function Navbar() {
  const profile = await getProfile();

  return (
    <header className="border-b border-foreground/15">
      <nav className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="font-semibold">
          {APP_NAME}
        </Link>

        {profile ? (
          <div className="flex items-center gap-4 text-sm">
            <Link href="/rooms" className="hover:underline">Ruangan</Link>
            <Link href="/bookings" className="hover:underline">Pemesanan Saya</Link>
            <span className="hidden text-foreground/60 sm:inline">
              {profile.full_name ?? profile.email}
              {profile.role === "admin" && " (admin)"}
            </span>
            <form action={logout}>
              <button type="submit" className="rounded-md border border-foreground/20 px-3 py-1 hover:bg-foreground/5">
                Keluar
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm">
            <Link href="/login" className="hover:underline">Masuk</Link>
            <Link href="/signup" className="rounded-md bg-foreground px-3 py-1 text-background">Daftar</Link>
          </div>
        )}
      </nav>
    </header>
  );
}
