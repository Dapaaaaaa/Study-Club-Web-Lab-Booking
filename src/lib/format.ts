import { APP_TIMEZONE } from "./config";

// Contoh hasil: "Sen, 12 Okt 2026 · 09.00–11.00"
export function formatRange(startIso: string, endIso: string) {
  const start = new Date(startIso);
  const end = new Date(endIso);

  const date = new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: APP_TIMEZONE,
  }).format(start);

  const time = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: APP_TIMEZONE,
  });

  return `${date} · ${time.format(start)}–${time.format(end)}`;
}

// Tanggal hari ini (YYYY-MM-DD) di zona waktu aplikasi, untuk atribut min pada input date
export function todayInAppTimezone() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: APP_TIMEZONE }).format(new Date());
}

// Sudah lewat dari waktu sekarang? (dipakai untuk menentukan tombol "Batalkan" masih boleh tampil)
export function hasEnded(endIso: string) {
  return new Date(endIso).getTime() <= Date.now();
}
