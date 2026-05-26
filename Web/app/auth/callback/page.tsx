"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { TOKEN_KEY } from "@/lib/auth";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      router.replace("/dashboard");
      return;
    }

    router.replace("/");
  }, [router, searchParams]);

  return (
    <main className="grid min-h-screen place-items-center bg-[#eef2f5] px-4">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-7 text-center shadow-[0_18px_48px_rgba(32,40,48,0.12)]">
        <div className="mx-auto mb-4 size-10 animate-pulse rounded-full bg-[#1b2838]" />
        <h1 className="text-xl font-extrabold text-slate-900">Finishing Steam Login</h1>
        <p className="mt-2 text-sm text-slate-600">Redirecting to your customer panel.</p>
      </section>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackContent />
    </Suspense>
  );
}
