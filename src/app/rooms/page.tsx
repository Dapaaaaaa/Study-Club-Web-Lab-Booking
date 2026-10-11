import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Room } from "@/lib/types";

export default async function RoomsPage() {
  await requireUser();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("id, name, capacity, description, is_active")
    .eq("is_active", true)
    .order("name");

  const rooms = (data ?? []) as Room[];

  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold">Ruangan Lab</h1>

      {error && <p className="text-red-600 dark:text-red-400">Gagal memuat ruangan: {error.message}</p>}
      {!error && rooms.length === 0 && (
        <p className="text-foreground/60">Belum ada ruangan. Jalankan supabase/02_seed.sql atau tambahkan lewat dashboard.</p>
      )}

      <ul className="grid gap-4 sm:grid-cols-2">
        {rooms.map((room) => (
          <li key={room.id} className="flex flex-col gap-2 rounded-lg border border-foreground/15 p-4">
            <h2 className="font-semibold">{room.name}</h2>
            <p className="text-sm text-foreground/60">Kapasitas {room.capacity} orang</p>
            {room.description && <p className="text-sm">{room.description}</p>}
            <Link
              href={`/bookings/new?room=${room.id}`}
              className="mt-2 w-fit rounded-md bg-foreground px-3 py-1.5 text-sm text-background"
            >
              Pesan ruangan ini
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
