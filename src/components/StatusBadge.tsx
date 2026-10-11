import type { BookingStatus } from "@/lib/types";

const STYLES: Record<BookingStatus, { label: string; className: string }> = {
  pending: { label: "Menunggu", className: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300" },
  approved: { label: "Disetujui", className: "bg-green-500/15 text-green-700 dark:text-green-300" },
  rejected: { label: "Ditolak", className: "bg-red-500/15 text-red-700 dark:text-red-300" },
  cancelled: { label: "Dibatalkan", className: "bg-foreground/10 text-foreground/60" },
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  const { label, className } = STYLES[status];
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>{label}</span>;
}
