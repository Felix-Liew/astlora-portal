"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchCurrentUser, SteamUser, TOKEN_KEY } from "@/lib/auth";

type PanelState = "loading" | "ready" | "signedOut" | "error";

export default function DashboardPage() {
  const router = useRouter();
  const [state, setState] = useState<PanelState>("loading");
  const [user, setUser] = useState<SteamUser | null>(null);
  const [message, setMessage] = useState("Loading customer panel...");

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      setState("signedOut");
      setMessage("Please sign in with Steam first.");
      router.replace("/");
      return;
    }

    async function loadDashboard() {
      try {
        const currentUser = await fetchCurrentUser(token);
        setUser(currentUser);
        setState("ready");
        setMessage("Customer panel ready.");
      } catch (error) {
        localStorage.removeItem(TOKEN_KEY);
        setState("error");
        setMessage(error instanceof Error ? error.message : "Unable to load profile.");
        router.replace("/");
      }
    }

    void loadDashboard();
  }, [router]);

  function signOut() {
    localStorage.removeItem(TOKEN_KEY);
    router.replace("/");
  }

  return (
    <main className="min-h-screen bg-[#eef2f5]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-lg bg-[#142033] font-extrabold text-white">
              A
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">Astlora Portal</p>
              <h1 className="text-lg font-extrabold text-slate-900">Customer Panel</h1>
            </div>
          </div>
          <button
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white"
            type="button"
            onClick={signOut}
          >
            Sign Out
          </button>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-6 md:grid-cols-[320px_1fr]">
        <aside className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-3">
            {user?.avatar_url ? (
              <Image
                className="rounded-lg border border-slate-200"
                src={user.avatar_url}
                alt={`${user.nickname ?? user.username} avatar`}
                width={72}
                height={72}
              />
            ) : (
              <div className="grid size-[72px] place-items-center rounded-lg bg-[#1b2838] text-2xl font-extrabold text-white">
                S
              </div>
            )}
            <div className="min-w-0">
              <h2 className="truncate text-lg font-extrabold text-slate-900">
                {user?.nickname ?? "Steam User"}
              </h2>
              <p className="truncate font-mono text-xs text-slate-500">
                {user?.steam_id ?? "Steam ID pending"}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            {message}
          </div>
        </aside>

        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase text-slate-500">Temporary Workspace</p>
            <h2 className="text-2xl font-extrabold text-slate-900">Customer Dashboard</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {["Account Overview", "Orders", "Support"].map((title) => (
              <div key={title} className="rounded-lg border border-dashed border-slate-300 p-5">
                <p className="text-sm font-extrabold text-slate-900">{title}</p>
                <p className="mt-2 text-sm text-slate-500">
                  Placeholder area. Real customer tools will be added here later.
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-lg bg-[#142033] p-5 text-white">
            <p className="text-sm font-bold text-white/70">Panel Status</p>
            <p className="mt-1 text-lg font-extrabold">
              {state === "ready" ? "Signed in with Steam" : "Preparing session"}
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
