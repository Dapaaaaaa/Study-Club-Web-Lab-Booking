import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // CATATAN UNTUK PESERTA:
  // Hasil `create-next-app` terbaru menyalakan `cacheComponents` + `partialPrefetching`.
  // Di starter ini keduanya SENGAJA dimatikan supaya model caching-nya sederhana
  // (halaman yang membaca cookie/login otomatis dinamis, tanpa perlu <Suspense> di mana-mana).
  // Kita aktifkan lagi nanti di pertemuan Caching sebagai latihan migrasi.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
