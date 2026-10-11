import { BookingForm } from "@/components/BookingForm";
import { requireUser } from "@/lib/auth";
import { todayInAppTimezone } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export default async function NewBookingPage(props: PageProps<"/bookings/new">) {
  await requireUser();
  const { room } = await props.searchParams;

  const supabase = await createClient();
  const { data: rooms } = await supabase
    .from("rooms")
    .select("id, name, capacity")
    .eq("is_active", true)
    .order("name");

  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold">Ajukan Pemesanan</h1>
      <BookingForm
        rooms={rooms ?? []}
        defaultRoomId={typeof room === "string" ? room : undefined}
        minDate={todayInAppTimezone()}
      />
    </section>
  );
}
