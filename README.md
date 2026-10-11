# Study-Club-Web-Lab-Booking
## Peminjaman Ruangan Lab — Starter Project Study Club Web

Aplikasi pemesanan ruangan laboratorium. Ini **titik awal** yang dikerjakan bareng di kelas;
setelah itu kamu bebas mengembangkannya sendiri (atau mengubahnya jadi aplikasi lain — lihat bagian *Aturan main*).

**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres + Auth) · Zod · Vercel

## Fitur yang SUDAH jalan

- Daftar, masuk, keluar (email + password)
- Halaman privat dijaga otomatis (belum login → diarahkan ke `/login`)
- Daftar ruangan lab
- Ajukan pemesanan (tanggal, jam, keperluan) dengan validasi
- **Jadwal bentrok ditolak oleh database**, bukan oleh kode aplikasi
- Lihat & batalkan pemesanan sendiri
- Aturan keamanan di level database (RLS): user hanya bisa melihat/membatalkan pemesanan miliknya

## Fitur yang BELUM ada (ini tugas kalian — lihat bagian *Tugas pengembangan*)

Persetujuan oleh admin, jadwal terisi per ruangan, kelola ruangan, notifikasi email, dan lain-lain.

---

## A. Menjalankan di komputer sendiri

### 1. Ambil kode & install

```bash
git clone <URL-REPO-INI>
cd lab-booking
bun install
```

> Pakai npm juga boleh: `npm install`. Cukup salah satu — **jangan commit dua lockfile sekaligus**
> (`bun.lock` dan `package-lock.json`).

### 2. Buat project Supabase

1. Buka [supabase.com](https://supabase.com) → login → **New project**.
2. Isi nama (bebas), **Database password** (simpan!), region terdekat (mis. *Southeast Asia / Singapore*) → **Create**. Tunggu ±2 menit.
3. Menu **SQL Editor** → **New query** → salin isi file `supabase/01_schema.sql` → **Run**.
4. Query baru lagi → salin `supabase/02_seed.sql` (ubah nama lab sesuai kampus kalian) → **Run**.
5. Menu **Authentication** → pengaturan provider **Email** → matikan **Confirm email**
   (hanya untuk belajar, supaya tidak perlu verifikasi email tiap daftar).

> Label menu di dashboard Supabase kadang berubah. Kalau tidak ketemu, cari kata kuncinya.

### 3. Isi environment variable

Ambil **Project URL** dan **Publishable key** dari tombol **Connect** di dashboard
(atau *Project Settings → API Keys*; kalau belum ada publishable key, klik *Create new API Keys*).

```bash
# macOS / Linux / WSL
cp .env.example .env.local

# Windows (PowerShell)
Copy-Item .env.example .env.local
```

Buka `.env.local`, isi dua nilainya. **Jangan pernah commit `.env.local`** (sudah ada di `.gitignore`).

### 4. Jalankan

```bash
bun dev
```

Buka http://localhost:3000 → **Daftar** → coba pesan ruangan. Coba juga pesan jam yang sama dari dua akun berbeda untuk melihat penolakan bentrok.

### 5. Menjadikan akun sebagai admin

Role admin sengaja **tidak bisa diubah dari aplikasi** (supaya aman). Lakukan lewat SQL Editor:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'emailkamu@contoh.com');
```

---

## B. Deploy ke Vercel

1. Push repo ke GitHub.
2. [vercel.com](https://vercel.com) → **Add New → Project** → pilih repo → sebelum klik Deploy, buka **Environment Variables**
   dan isi `NEXT_PUBLIC_SUPABASE_URL` serta `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (nilai sama seperti `.env.local`).
3. **Deploy**. Setelah itu setiap `git push` ke `main` otomatis ter-deploy, dan setiap Pull Request mendapat URL preview sendiri.

---

## C. Peta kode

```
supabase/
  01_schema.sql        Tabel, constraint anti-bentrok, aturan RLS  (JALANKAN DULU)
  02_seed.sql          Data awal ruangan
src/
  proxy.ts             Dijalankan sebelum tiap halaman: refresh sesi + jaga halaman privat
  lib/
    config.ts          Nama aplikasi & zona waktu (default WITA)
    auth.ts            getCurrentUser / requireUser / getProfile  (satu pintu "siapa user ini?")
    format.ts          Format tanggal & jam
    types.ts           Tipe data bersama
    supabase/
      server.ts        Klien Supabase untuk server (Server Component & Server Action)
      client.ts        Klien Supabase untuk browser (belum dipakai)
      proxy.ts         Logika refresh sesi + redirect, dipanggil dari src/proxy.ts
  actions/             SEMUA Server Action (kode yang jalan di server, dipanggil dari form)
    auth.ts            login, signup, logout
    bookings.ts        createBooking, cancelBooking
  components/          Navbar, AuthForm, BookingForm, StatusBadge
  app/                 Halaman: /  /login  /signup  /rooms  /bookings  /bookings/new
```

**Alur satu pemesanan:**
`BookingForm` (Client Component) → submit → `createBooking` (Server Action) → validasi Zod → cek jam →
`insert` ke Supabase → database cek RLS + cek bentrok → sukses: redirect ke `/bookings`; bentrok: error `23P01` → pesan ramah ke user.

## D. Konsep kunci (baca sebelum mengubah kode)

| Konsep | Di mana | Intinya |
|---|---|---|
| Server vs Client Component | `app/*` vs `components/AuthForm.tsx` | Default Server Component. `"use client"` hanya untuk yang butuh interaksi (form dengan state). |
| Server Action | `src/actions/*` | Fungsi server yang dipanggil langsung dari `<form action=...>`. **Validasi ulang di sini**, jangan percaya validasi browser. |
| Proxy | `src/proxy.ts` | Dulu bernama `middleware.ts` (Next.js ≤ 15). Menjaga halaman & me-refresh sesi login. |
| `getClaims()` | `lib/supabase/proxy.ts`, `lib/auth.ts` | Cara **benar** memeriksa user login di server. Jangan pakai `getSession()` untuk keputusan keamanan. |
| RLS | `01_schema.sql` bagian 4 | Aturan akses ditegakkan **database**, jadi tetap aman walau API dipanggil langsung. |
| Exclusion constraint | `01_schema.sql` tabel `bookings` | Anti-bentrok dijaga database. Kalau dicek di kode saja, dua request bersamaan bisa lolos (*race condition*). |

---

## E. Tugas pengembangan (pilih sendiri, urut dari mudah)

| Level | Tugas | Petunjuk |
|---|---|---|
| Mudah | Ganti nama lab, warna, teks halaman utama | `02_seed.sql`, kelas Tailwind, `app/page.tsx` |
| Mudah | Tab filter status di *Pemesanan Saya* | Pakai `searchParams` di `app/bookings/page.tsx` |
| Sedang | **Halaman admin** `/admin/bookings`: daftar pemesanan *pending* + tombol Setujui/Tolak | Cek `getProfile()` → `role === "admin"` lalu `redirect`. RLS sudah mengizinkan admin mengubah status. |
| Sedang | **Jadwal terisi per ruangan** (agar user tahu jam mana yang kosong sebelum memesan) | RLS menyembunyikan pemesanan orang lain. Buat *view* yang hanya menampilkan `room_id, start_time, end_time` dan beri `grant select`. Pelajari `security_invoker` pada view. |
| Sedang | Admin: tambah/ubah/nonaktifkan ruangan | Policy `rooms: admin kelola` sudah ada |
| Sedang | Aturan bisnis: jam operasional 08.00–17.00, durasi maksimal 3 jam | Tambah di Zod **dan** `check` constraint di database |
| Sedang | Upload foto ruangan | Supabase Storage |
| Lanjut | Notifikasi email saat pemesanan disetujui | Resend / Supabase Edge Function |
| Lanjut | Konfirmasi email + login Google | Hidupkan *Confirm email*, buat route `/auth/confirm` |
| Lanjut | Tipe database otomatis | `supabase gen types typescript`, lalu hapus cast `as unknown as` |
| Lanjut | Aktifkan **Cache Components** | Lihat catatan di `next.config.ts`; pelajari `use cache` & `<Suspense>` |
| Lanjut | Testing | Vitest (validasi) · Playwright (alur login → pesan) |

## F. Aturan main

- **Kerangka bersama dulu, bebas setelahnya.** Sampai starter ini berjalan di laptop kamu, ikuti struktur yang ada.
  Setelah itu: boleh lanjut mengembangkan ruangan lab, atau mengganti domain (peminjaman kamera, buku, alat band, dst.).
  Pola yang sama berlaku: ganti tabel `rooms`, pertahankan alur `bookings` + RLS + anti-bentrok.
- **Satu fitur = satu branch**: `git checkout -b fitur/halaman-admin`.
- Buka **Pull Request** → tunggu URL preview Vercel → minta teman me-review → baru merge ke `main`.
- Perubahan database (`.sql`) **wajib ikut di-commit** dan dicatat di deskripsi PR, supaya teman bisa menjalankan hal yang sama.
- Jangan commit `.env.local`, password database, atau key rahasia apa pun.

## G. Catatan penting

- **Cache Components dimatikan** di `next.config.ts` (hasil `create-next-app` terbaru menyalakannya). Ini penyederhanaan untuk belajar, bukan "cara selamanya": dokumentasi Next.js menyebut fitur ini akan jadi bawaan di versi mayor berikutnya.
- **Supabase gratis akan di-pause setelah ±1 minggu tidak aktif.** Data tidak hilang; buka dashboard dan aktifkan kembali sebelum sesi kelas dimulai.
- **Zona waktu** diatur di `src/lib/config.ts` (default WITA). Kalau berbeda, ubah `APP_TIMEZONE` **dan** `APP_UTC_OFFSET` sekaligus.
- `AGENTS.md` dibuat otomatis oleh Next.js (aturan untuk AI coding assistant). Biarkan ikut ter-commit.
- Font Geist diunduh dari Google Fonts saat build. Kalau build gagal karena jaringan, pakai `next/font/local`.

## H. (Opsional) Membangun ulang dari nol di kelas

Kalau mau diketik bertahap, urutannya:

```bash
bunx create-next-app@latest lab-booking
#  TypeScript: Yes · ESLint: Yes · Tailwind: Yes · src/ directory: Yes · App Router: Yes · alias @/*: default
cd lab-booking
bun add @supabase/supabase-js @supabase/ssr zod
```

1. Matikan `cacheComponents` & `partialPrefetching` di `next.config.ts`
2. Buat project Supabase + jalankan `supabase/01_schema.sql` dan `02_seed.sql`
3. `.env.local` + `lib/supabase/{server,client,proxy}.ts` + `src/proxy.ts`
4. `lib/auth.ts` → `actions/auth.ts` → `AuthForm` → halaman `/login` & `/signup`
5. `/rooms` → `actions/bookings.ts` → `BookingForm` → `/bookings/new` → `/bookings`
