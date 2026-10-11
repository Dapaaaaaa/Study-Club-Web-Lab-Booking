-- Data awal ruangan. Ubah nama/kapasitas sesuai lab di kampus kalian, lalu Run di SQL Editor.
insert into public.rooms (name, capacity, description) values
  ('Lab Pemrograman', 30, 'PC 30 unit, proyektor, AC'),
  ('Lab Jaringan',    24, 'Perangkat jaringan praktikum, rak server mini'),
  ('Lab Multimedia',  20, 'PC spesifikasi tinggi, area rekam')
on conflict (name) do nothing;
