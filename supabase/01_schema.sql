-- =====================================================================
-- SKEMA DATABASE: Peminjaman Ruangan Lab
-- Jalankan di: Supabase Dashboard -> SQL Editor -> New query -> Run
-- =====================================================================

-- Ekstensi agar Postgres bisa membandingkan "rentang waktu" untuk cegah bentrok
create extension if not exists btree_gist;

-- ---------------------------------------------------------------------
-- 1. PROFILES: data tambahan user (nama, role). 1 baris per akun login.
-- ---------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  role        text not null default 'user' check (role in ('user', 'admin')),
  created_at  timestamptz not null default now()
);

-- Otomatis buat baris profiles setiap ada user baru mendaftar
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- 2. ROOMS: daftar ruangan lab
-- ---------------------------------------------------------------------
create table public.rooms (
  id           uuid primary key default gen_random_uuid(),
  name         text not null unique,
  capacity     int  not null check (capacity > 0),
  description  text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3. BOOKINGS: pemesanan ruangan
-- ---------------------------------------------------------------------
create table public.bookings (
  id          uuid primary key default gen_random_uuid(),
  room_id     uuid not null references public.rooms (id)    on delete cascade,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  purpose     text not null,
  start_time  timestamptz not null,
  end_time    timestamptz not null,
  status      text not null default 'pending'
              check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  created_at  timestamptz not null default now(),

  constraint valid_time_range check (end_time > start_time),

  -- INTI FITUR: satu ruangan tidak boleh punya 2 pemesanan aktif yang jamnya beririsan.
  -- Pemesanan 'rejected'/'cancelled' tidak dihitung, jadi jam itu bisa dipesan lagi.
  -- Jam selesai 11:00 dan jam mulai 11:00 TIDAK dianggap bentrok.
  constraint no_double_booking exclude using gist (
    room_id with =,
    tstzrange(start_time, end_time) with &&
  ) where (status in ('pending', 'approved'))
);

create index bookings_user_id_idx on public.bookings (user_id);

-- ---------------------------------------------------------------------
-- 4. HAK AKSES (RLS = Row Level Security)
--    Aturan "siapa boleh lihat/ubah baris mana" ditegakkan oleh database,
--    jadi tetap aman walau ada yang memanggil API langsung tanpa lewat aplikasi kita.
-- ---------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.rooms    enable row level security;
alter table public.bookings enable row level security;

-- Helper: apakah user yang sedang login adalah admin?
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- profiles: lihat milik sendiri (admin lihat semua). Tidak ada policy UPDATE,
-- jadi user biasa tidak bisa mengangkat dirinya jadi admin.
create policy "profiles: lihat sendiri atau admin"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id or public.is_admin());

-- rooms: semua user login boleh lihat; hanya admin boleh tambah/ubah/hapus
create policy "rooms: semua user login boleh lihat"
  on public.rooms for select to authenticated
  using (true);

create policy "rooms: admin kelola"
  on public.rooms for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- bookings: lihat milik sendiri (admin lihat semua)
create policy "bookings: lihat sendiri atau admin"
  on public.bookings for select to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

-- bookings: user hanya boleh membuat pemesanan atas namanya sendiri, dan statusnya harus 'pending'
create policy "bookings: user buat untuk diri sendiri"
  on public.bookings for insert to authenticated
  with check (user_id = (select auth.uid()) and status = 'pending');

-- bookings: user hanya boleh MEMBATALKAN pemesanannya sendiri (status baru harus 'cancelled')
create policy "bookings: user batalkan miliknya"
  on public.bookings for update to authenticated
  using (user_id = (select auth.uid()) and status in ('pending', 'approved'))
  with check (user_id = (select auth.uid()) and status = 'cancelled');

-- bookings: admin boleh mengubah/menghapus apa saja (dipakai untuk fitur approve/reject nanti)
create policy "bookings: admin kelola"
  on public.bookings for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------
-- 5. GRANT: izin tingkat tabel (RLS di atas yang menyaring barisnya)
-- ---------------------------------------------------------------------
grant usage on schema public to authenticated;
grant select                          on public.profiles to authenticated;
grant select, insert, update, delete  on public.rooms    to authenticated;
grant select, insert, update, delete  on public.bookings to authenticated;
