"use client";

import { useActionState } from "react";
import { createBooking } from "@/actions/bookings";

type Props = {
  rooms: { id: string; name: string; capacity: number }[];
  defaultRoomId?: string;
  minDate: string; // YYYY-MM-DD
};

const inputClass =
  "w-full rounded-md border border-foreground/20 bg-transparent px-3 py-2 outline-none focus:border-foreground/60";

export function BookingForm({ rooms, defaultRoomId, minDate }: Props) {
  const [state, formAction, pending] = useActionState(createBooking, undefined);
  const f = state?.fields;

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Ruangan
        <select name="room_id" required defaultValue={f?.room_id ?? defaultRoomId ?? ""} className={inputClass}>
          <option value="" disabled>Pilih ruangan...</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name} (kapasitas {room.capacity})
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Tanggal
        <input name="date" type="date" required min={minDate} defaultValue={f?.date} className={inputClass} />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Jam mulai
          <input name="start" type="time" step={1800} required defaultValue={f?.start} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Jam selesai
          <input name="end" type="time" step={1800} required defaultValue={f?.end} className={inputClass} />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        Keperluan
        <textarea
          name="purpose"
          required
          rows={3}
          maxLength={200}
          defaultValue={f?.purpose}
          placeholder="Contoh: Praktikum Basis Data kelas 3A"
          className={inputClass}
        />
      </label>

      {state?.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-foreground px-4 py-2 text-background disabled:opacity-60"
      >
        {pending ? "Menyimpan..." : "Ajukan Pemesanan"}
      </button>
    </form>
  );
}
