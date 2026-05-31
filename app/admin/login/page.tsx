"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    login,
    undefined,
  );

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#f7e1cd] p-6">
      <div className="w-full max-w-sm rounded-2xl bg-white/80 p-8 shadow-xl ring-1 ring-black/5 backdrop-blur">
        <div className="mb-6 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[#c08552]">
            Wedding Builder
          </p>
          <h1 className="mt-2 font-serif text-2xl text-[#4a3b2f]">
            Admin Sign In
          </h1>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="mb-1 block text-sm font-medium text-[#4a3b2f]"
            >
              Username
            </label>
            <input
              id="username"
              name="username"
              autoComplete="username"
              defaultValue="admin"
              className="w-full rounded-lg border border-[#e6cdb3] bg-white px-3 py-2 text-[#4a3b2f] outline-none focus:border-[#c08552] focus:ring-2 focus:ring-[#c08552]/30"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-[#4a3b2f]"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-lg border border-[#e6cdb3] bg-white px-3 py-2 text-[#4a3b2f] outline-none focus:border-[#c08552] focus:ring-2 focus:ring-[#c08552]/30"
            />
          </div>

          {state?.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-[#c08552] px-4 py-2.5 font-medium text-white transition-colors hover:bg-[#a8703f] disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}
