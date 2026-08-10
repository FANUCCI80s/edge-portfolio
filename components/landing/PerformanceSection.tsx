const stats = [
  {
    value: "24/7",
    label: "Market access",
  },
  {
    value: "3+",
    label: "Market categories",
  },
  {
    value: "Real-time",
    label: "Market monitoring",
  },
  {
    value: "Secure",
    label: "Account infrastructure",
  },
];

const markets = [
  {
    name: "BTC/USD",
    price: "$67,842.21",
    change: "+2.84%",
    bars: [25, 35, 28, 45, 38, 55, 42, 65, 58, 72, 64, 82],
  },
  {
    name: "EUR/USD",
    price: "1.1742",
    change: "+0.31%",
    bars: [40, 32, 45, 38, 50, 42, 58, 52, 64, 60, 70, 76],
  },
  {
    name: "S&P 500",
    price: "6,482.17",
    change: "+1.08%",
    bars: [30, 42, 35, 50, 46, 58, 52, 64, 57, 68, 62, 78],
  },
];

export default function PerformanceSection() {
  return (
    <section
      id="performance"
      className="border-t border-white/[0.06] py-28"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
              Market Performance
            </p>

            <h2 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Stay close to the markets that matter.
            </h2>

            <p className="mt-6 max-w-lg leading-7 text-zinc-500">
              Monitor market movement and keep important price information
              visible through a clean, focused trading environment.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5"
                >
                  <p className="text-xl font-bold text-white">
                    {stat.value}
                  </p>

                  <p className="mt-1 text-xs text-zinc-600">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#080b09] shadow-2xl shadow-black/30">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
              <div>
                <p className="text-sm font-semibold text-white">
                  Market Overview
                </p>

                <p className="mt-1 text-xs text-zinc-600">
                  Selected market instruments
                </p>
              </div>

              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-medium text-emerald-400">
                LIVE
              </span>
            </div>

            <div className="divide-y divide-white/[0.06]">
              {markets.map((market) => (
                <div
                  key={market.name}
                  className="flex items-center gap-5 px-6 py-6"
                >
                  <div className="min-w-24">
                    <p className="text-sm font-medium text-white">
                      {market.name}
                    </p>

                    <p className="mt-1 text-xs text-zinc-600">
                      Market
                    </p>
                  </div>

                  <div className="hidden h-12 flex-1 items-end gap-1 sm:flex">
                    {market.bars.map((height, index) => (
                      <div
                        key={index}
                        className="flex-1 rounded-t bg-emerald-500/30"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>

                  <div className="ml-auto text-right">
                    <p className="text-sm font-semibold text-white">
                      {market.price}
                    </p>

                    <p className="mt-1 text-xs font-medium text-emerald-400">
                      {market.change}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}