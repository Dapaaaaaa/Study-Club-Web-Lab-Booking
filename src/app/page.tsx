import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <section className="flex flex-col items-start gap-4 py-8">
      <h1 className="text-3xl font-bold">Pesan ruangan lab tanpa bolak-balik tanya aslab</h1>
      <p className="max-w-xl text-foreground/70">
        Lihat ruangan yang tersedia, ajukan jadwal pemakaian, dan pantau status persetujuannya
        di satu tempat.
      </p>
      <Link
        href={user ? "/rooms" : "/login"}
        className="rounded-md bg-foreground px-4 py-2 text-background"
      >
        {user ? "Lihat ruangan" : "Masuk untuk memesan"}
      </Link>
    </section>
  );
}
