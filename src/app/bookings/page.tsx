import Link from "next/link";
import { cancelBooking } from "@/actions/bookings";
import { StatusBadge } from "@/components/StatusBadge";
import { requireUser } from "@/lib/auth";
import { formatRange, hasEnded } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { BookingWithRoom } from "@/lib/types";

export default async function BookingsPage() {
  const user = await requireUser();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("id, purpose, start_time, end_time, status, rooms(name)")
    .eq("user_id", user.id)
    .order("start_time", { ascending: false });

  const bookings = (data ?? []) as unknown as BookingWithRoom[];

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pemesanan Saya</h1>
        <Link href="/bookings/new" className="rounded-md bg-foreground px-3 py-1.5 text-sm text-background">
          + Pesan baru
        </Link>
      </div>

      {error && <p className="text-red-600 dark:text-red-400">Gagal memuat pemesanan: {error.message}</p>}
      {!error && bookings.length === 0 && <p className="text-foreground/60">Kamu belum punya pemesanan.</p>}

      <ul className="flex flex-col gap-3">
        {bookings.map((b) => {
          const canCancel = (b.status === "pending" || b.status === "approved") && !hasEnded(b.end_time);

          return (
            <li key={b.id} className="flex items-start justify-between gap-4 rounded-lg border border-foreground/15 p-4">
              <div className="flex flex-col gap-1">
                <p className="font-semibold">{b.rooms?.name ?? "Ruangan"}</p>
                <p className="text-sm text-foreground/70">{formatRange(b.start_time, b.end_time)}</p>
                <p className="text-sm">{b.purpose}</p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={b.status} />
                {canCancel && (
                  <form action={cancelBooking}>
                    <input type="hidden" name="id" value={b.id} />
                    <button type="submit" className="text-sm text-red-600 underline dark:text-red-400">
                      Batalkan
                    </button>
                  </form>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
