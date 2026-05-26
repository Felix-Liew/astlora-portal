"use client";

import Link from "next/link";
import { API_BASE_URL } from "@/lib/auth";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#eef2f5] px-4 py-8">
      <section className="w-full max-w-[520px] rounded-lg border border-slate-200 bg-white/95 p-7 shadow-[0_18px_48px_rgba(32,40,48,0.12)]">
        <div className="mb-6 flex items-center gap-4">
          <div className="grid size-11 place-items-center rounded-lg bg-[#142033] font-extrabold text-white">
            A
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-500">Astlora Portal</p>
            <h1 className="text-3xl font-extrabold text-slate-900">Steam Login</h1>
          </div>
        </div>

        <div className="mb-6 flex min-h-11 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">
          <span className="size-2.5 rounded-full bg-slate-400" />
          <span>Sign in with Steam to enter the customer panel.</span>
        </div>

        <div className="mb-6 grid min-h-32 place-items-center gap-3 text-center text-slate-600">
          <div className="grid size-16 place-items-center rounded-full bg-[#1b2838] text-3xl font-extrabold text-white">
            S
          </div>
          <p className="max-w-sm">
            Steam is the only authentication method for this portal.
          </p>
        </div>

        <a
          className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-lg bg-[#1b2838] px-4 font-extrabold text-white"
          href={`${API_BASE_URL}/api/auth/steam/login`}
        >
          <span className="grid size-6 place-items-center rounded-full bg-white/15">S</span>
          <span>Continue with Steam</span>
        </a>

        <Link
          className="mt-4 inline-flex w-full justify-center text-sm font-bold text-slate-500"
          href="/dashboard"
        >
          Open customer panel
        </Link>
      </section>
    </main>
  );
}
