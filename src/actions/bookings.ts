"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { APP_UTC_OFFSET } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/types";

const bookingSchema = z.object({
  room_id: z.uuid("Pilih ruangan terlebih dahulu"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal wajib diisi"),
  start: z.string().regex(/^\d{2}:\d{2}$/, "Jam mulai wajib diisi"),
  end: z.string().regex(/^\d{2}:\d{2}$/, "Jam selesai wajib diisi"),
  purpose: z
    .string()
    .trim()
    .min(5, "Keperluan minimal 5 karakter")
    .max(200, "Keperluan maksimal 200 karakter"),
});

export async function createBooking(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();

  // Simpan isi form supaya bisa ditampilkan lagi kalau ada error
  const fields: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && !key.startsWith("$")) fields[key] = value;
  }

  // 1) Validasi bentuk input
  const parsed = bookingSchema.safeParse(fields);
  if (!parsed.success) return { error: parsed.error.issues[0].message, fields };
  const { room_id, date, start, end, purpose } = parsed.data;

  // 2) Validasi aturan bisnis (jam)
  const startTime = new Date(`${date}T${start}:00${APP_UTC_OFFSET}`);
  const endTime = new Date(`${date}T${end}:00${APP_UTC_OFFSET}`);
  if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
    return { error: "Tanggal atau jam tidak valid", fields };
  }
  if (endTime <= startTime) return { error: "Jam selesai harus setelah jam mulai", fields };
  if (startTime < new Date()) {
    return { error: "Tidak bisa memesan untuk waktu yang sudah lewat", fields };
  }

  // 3) Simpan. Bentrok jadwal dicegah oleh DATABASE (exclusion constraint), bukan oleh kode ini.
  const supabase = await createClient();
  const { error } = await supabase.from("bookings").insert({
    room_id,
    user_id: user.id,
    purpose,
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
  });

  if (error) {
    // 23P01 = exclusion_violation (jadwal bentrok)
    if (error.code === "23P01") {
      return { error: "Ruangan sudah dipesan pada jam tersebut. Pilih jam lain.", fields };
    }
    console.error("createBooking error:", error);
    return { error: "Gagal menyimpan pemesanan. Coba lagi.", fields };
  }

  revalidatePath("/bookings");
  redirect("/bookings");
}

export async function cancelBooking(formData: FormData) {
  await requireUser();

  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return;

  // RLS di database memastikan user hanya bisa membatalkan pemesanan miliknya sendiri
  const supabase = await createClient();
  const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id.data);
  if (error) console.error("cancelBooking error:", error);

  revalidatePath("/bookings");
}
