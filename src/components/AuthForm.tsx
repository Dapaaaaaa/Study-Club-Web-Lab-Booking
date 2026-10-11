"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { FormState } from "@/lib/types";

type Props = {
  mode: "login" | "signup";
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
};

const inputClass =
  "w-full rounded-md border border-foreground/20 bg-transparent px-3 py-2 outline-none focus:border-foreground/60";

export function AuthForm({ mode, action }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const isSignup = mode === "signup";

  return (
    <form action={formAction} className="mx-auto flex max-w-sm flex-col gap-4">
      <h1 className="text-2xl font-bold">{isSignup ? "Daftar akun" : "Masuk"}</h1>

      {isSignup && (
        <label className="flex flex-col gap-1 text-sm">
          Nama lengkap
          <input name="full_name" required className={inputClass} autoComplete="name" />
        </label>
      )}

      <label className="flex flex-col gap-1 text-sm">
        Email
        <input name="email" type="email" required className={inputClass} autoComplete="email" />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Password
        <input
          name="password"
          type="password"
          required
          minLength={isSignup ? 8 : undefined}
          className={inputClass}
          autoComplete={isSignup ? "new-password" : "current-password"}
        />
      </label>

      {state?.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {state?.message && <p className="text-sm text-green-700 dark:text-green-400">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-foreground px-4 py-2 text-background disabled:opacity-60"
      >
        {pending ? "Memproses..." : isSignup ? "Daftar" : "Masuk"}
      </button>

      <p className="text-sm text-foreground/60">
        {isSignup ? "Sudah punya akun? " : "Belum punya akun? "}
        <Link href={isSignup ? "/login" : "/signup"} className="underline">
          {isSignup ? "Masuk" : "Daftar"}
        </Link>
      </p>
    </form>
  );
}
