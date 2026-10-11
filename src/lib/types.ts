export type BookingStatus = "pending" | "approved" | "rejected" | "cancelled";

export type Room = {
  id: string;
  name: string;
  capacity: number;
  description: string | null;
  is_active: boolean;
};

export type BookingWithRoom = {
  id: string;
  purpose: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  rooms: { name: string } | null;
};

// State yang dikembalikan Server Action ke form (dipakai useActionState)
export type FormState =
  | {
      error?: string;
      message?: string;
      fields?: Record<string, string>; // isi form sebelumnya, supaya tidak hilang saat error
    }
  | undefined;
