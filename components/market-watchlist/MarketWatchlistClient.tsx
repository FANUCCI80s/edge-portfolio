
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type MarketCategory = "Crypto" | "Stocks" | "Forex";

type MarketItem = {
  symbol: string;
  name: string;
  category: MarketCategory;
  price: number;
  change: number | null;
  source: string;
};

type MarketResponse = {
  success: boolean;
  updatedAt?: string;
  markets?: MarketItem[];
  message?: string;
};

const categories = ["All", "Crypto", "Stocks", "Forex"] as const;

export default function MarketWatchlistClient() {
  const [markets, setMarkets] = useState<MarketItem[]>([]);
  const [category, setCategory] =
    useState<(typeof categories)[number]>("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const loadMarkets = useCallback(async (manualRefresh = false) => {
    try {
      if (manualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch("/api/market-watchlist", {
        method: "GET",
        cache: "no-store",
      });

      const data: MarketResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load market data."
        );
      }

      setMarkets(data.markets || []);
      setUpdatedAt(data.updatedAt || null);
    } catch (err) {
      console.error("Market watchlist error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load market data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMarkets();

    const interval = window.setInterval(() => {
      loadMarkets(true);
    }, 60_000);

    return () => {
      window.clearInterval(interval);
    };
  }, [loadMarkets]);

  const filteredMarkets = useMemo(() => {
    const query = search.trim().toLowerCase();

    return markets.filter((market) => {
      const matchesCategory =
        category === "All" ||
        market.category === category;

      const matchesSearch =
        !query ||
        market.symbol.toLowerCase().includes(query) ||
        market.name.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [markets, category, search]);

  const risingMarkets = markets.filter(
    (market) =>
      market.change !== null &&
      market.change > 0
  ).length;

  const formatPrice = (market: MarketItem) => {
    if (market.category === "Forex") {
      return market.price.toLocaleString("en-US", {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
      });
    }

    return market.price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatChange = (change: number | null) => {
    if (change === null || !Number.isFinite(change)) {
      return "—";
    }

    const sign = change > 0 ? "+" : "";

    return `${sign}${change.toFixed(2)}%`;
  };

  const formatUpdatedAt = () => {
    if (!updatedAt) {
      return "Waiting for market data";
    }

    const date = new Date(updatedAt);

    if (Number.isNaN(date.getTime())) {
      return "Recently updated";
    }

    return `Updated ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })}`;
  };

  return (
    <>
      {/* Market Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/[0.06] p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              Markets tracked
            </p>

            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400">
              ◈
            </span>
          </div>

          <p className="mt-4 text-3xl font-semibold">
            {loading ? "—" : markets.length}
          </p>

          <p className="mt-2 text-xs text-zinc-600">
            Crypto, stocks and forex instruments
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              Markets rising
            </p>

            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400">
              ↑
            </span>
          </div>

          <p className="mt-4 text-3xl font-semibold">
            {loading ? "—" : risingMarkets}
          </p>

          <p className="mt-2 text-xs text-zinc-600">
            Instruments currently showing positive movement
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              Market status
            </p>

            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400">
              ●
            </span>
          </div>

          <p className="mt-4 text-xl font-semibold">
            {error ? "Unavailable" : "Live data"}
          </p>

          <p className="mt-2 text-xs text-zinc-600">
            {formatUpdatedAt()}
          </p>
        </div>
      </div>

      {/* Markets */}
      <section className="mt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-zinc-500">
              Markets
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              Explore markets
            </h2>
          </div>

          <button
            type="button"
            onClick={() => loadMarkets(true)}
            disabled={refreshing}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-emerald-400/30 hover:bg-emerald-400/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {refreshing ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>

        {/* Categories */}
        <div className="mt-5 flex flex-wrap gap-2">
          {categories.map((item) => {
            const active = category === item;

            return (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-emerald-500 text-black"
                    : "border border-white/10 bg-white/[0.03] text-zinc-400 hover:border-emerald-400/30 hover:text-white"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="mt-5">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600">
              ⌕
            </span>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search markets by name or symbol..."
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] py-3.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 transition focus:border-emerald-400/40 focus:bg-white/[0.04]"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/[0.05] p-4">
            <p className="text-sm font-medium text-red-400">
              Market data unavailable
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              {error}
            </p>
          </div>
        )}

        {/* Market Table */}
        <div className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
          <div className="hidden border-b border-white/10 px-6 py-4 text-xs font-medium uppercase tracking-wider text-zinc-600 md:grid md:grid-cols-[1.8fr_1fr_1fr_0.8fr_0.7fr]">
            <div>Market</div>
            <div>Category</div>
            <div>Price</div>
            <div className="text-right">24h Change</div>
            <div className="text-right">Source</div>
          </div>

          {loading ? (
            <div className="divide-y divide-white/10">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="px-5 py-6 sm:px-6"
                >
                  <div className="animate-pulse">
                    <div className="h-4 w-32 rounded bg-white/10" />
                    <div className="mt-3 h-3 w-24 rounded bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredMarkets.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.05] text-zinc-500">
                ⌕
              </div>

              <h3 className="mt-4 font-medium">
                No markets found
              </h3>

              <p className="mt-2 text-sm text-zinc-600">
                Try another search or market category.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {filteredMarkets.map((market) => {
                const positive =
                  market.change !== null &&
                  market.change > 0;

                const negative =
                  market.change !== null &&
                  market.change < 0;

                return (
                  <div
                    key={`${market.category}-${market.symbol}`}
                    className="group px-5 py-5 transition hover:bg-white/[0.025] sm:px-6"
                  >
                    <div className="grid gap-4 md:grid-cols-[1.8fr_1fr_1fr_0.8fr_0.7fr] md:items-center">
                      {/* Market */}
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-sm font-semibold text-emerald-400">
                          {market.symbol.charAt(0)}
                        </div>

                        <div className="min-w-0">
                          <p className="font-medium">
                            {market.symbol}
                          </p>

                          <p className="mt-1 truncate text-xs text-zinc-600">
                            {market.name}
                          </p>
                        </div>
                      </div>

                      {/* Category */}
                      <div>
                        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-zinc-500">
                          {market.category}
                        </span>
                      </div>

                      {/* Price */}
                      <div>
                        <p className="text-sm font-medium">
                          {formatPrice(market)}
                        </p>

                        <p className="mt-1 text-xs text-zinc-600">
                          {market.source}
                        </p>
                      </div>

                      {/* Change */}
                      <div className="text-left md:text-right">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            positive
                              ? "bg-emerald-400/10 text-emerald-400"
                              : negative
                              ? "bg-red-400/10 text-red-400"
                              : "bg-white/[0.05] text-zinc-500"
                          }`}
                        >
                          {formatChange(market.change)}
                        </span>
                      </div>

                      {/* Source */}
                      <div className="text-left md:text-right">
                        <span className="text-xs text-zinc-600">
                          {market.source}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Market Information */}
      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-zinc-500">
                Cryptocurrency
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                Digital asset markets
              </h2>
            </div>

            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400">
              ₿
            </span>
          </div>

          <p className="mt-4 text-sm leading-6 text-zinc-600">
            Monitor major cryptocurrencies using live
            market information supplied by the configured
            market-data source.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-lg bg-black/20 px-3 py-2 text-xs text-zinc-500">
              BTC/USD
            </span>

            <span className="rounded-lg bg-black/20 px-3 py-2 text-xs text-zinc-500">
              ETH/USD
            </span>

            <span className="rounded-lg bg-black/20 px-3 py-2 text-xs text-zinc-500">
              SOL/USD
            </span>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-zinc-500">
                Traditional markets
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                Stocks & forex
              </h2>
            </div>

            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] text-zinc-300">
              $
            </span>
          </div>

          <p className="mt-4 text-sm leading-6 text-zinc-600">
            Follow selected equities and major currency
            pairs from the same market-monitoring interface.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-lg bg-black/20 px-3 py-2 text-xs text-zinc-500">
              AAPL
            </span>

            <span className="rounded-lg bg-black/20 px-3 py-2 text-xs text-zinc-500">
              TSLA
            </span>

            <span className="rounded-lg bg-black/20 px-3 py-2 text-xs text-zinc-500">
              NVDA
            </span>

            <span className="rounded-lg bg-black/20 px-3 py-2 text-xs text-zinc-500">
              EUR/USD
            </span>
          </div>
        </div>
      </section>

      {/* Data Notice */}
      <section className="mt-8 rounded-3xl border border-yellow-400/10 bg-yellow-400/[0.03] p-6">
        <div className="flex gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
            !
          </div>

          <div>
            <h3 className="font-medium text-yellow-300">
              Market data information
            </h3>

            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Market prices are supplied by external market
              data providers and may be delayed depending on
              the source. This page is for market monitoring
              only and does not execute trading orders or
              real-money transactions.
            </p>
          </div>
        </div>
      </section>

      <p className="mt-8 text-center text-xs text-zinc-700">
        Edge Portfolio • Market Watchlist
      </p>
    </>
  );
}

