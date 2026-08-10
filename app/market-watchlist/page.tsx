

import Link from "next/link";
import { requireAuthenticatedPage } from "@/lib/auth/guards";
import DashboardNav from "@/components/dashboard/DashboardNav";
import MarketWatchlistClient from "@/components/market-watchlist/MarketWatchlistClient";

export default async function MarketWatchlistPage() {
  const user = await requireAuthenticatedPage();

  const firstName = user.firstName || "Trader";

  return (
    <main className="min-h-screen bg-[#050706] text-white">
      <div className="flex min-h-screen">
        <DashboardNav />

        <section className="min-w-0 flex-1">
          {/* Mobile Header */}
          <header className="border-b border-white/10 bg-[#080a09] px-5 py-4 lg:hidden">
            <div className="flex items-center justify-between gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-400/10">
                  <span className="font-bold text-emerald-400">
                    E
                  </span>
                </div>

                <span className="font-semibold">
                  Edge Portfolio
                </span>
              </Link>

              <Link
                href="/dashboard"
                className="text-sm text-zinc-500 transition hover:text-white"
              >
                Dashboard
              </Link>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
            {/* Page Header */}
            <div className="mb-8">
              <p className="text-sm font-medium text-emerald-400">
                Live market overview
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                Market Watchlist
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                Welcome back, {firstName}. Monitor cryptocurrency,
                stock, and forex markets using live market data.
              </p>
            </div>

            <MarketWatchlistClient />
          </div>
        </section>
      </div>
    </main>
  );
}

