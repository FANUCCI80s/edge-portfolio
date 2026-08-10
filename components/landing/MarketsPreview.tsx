const markets = [
  {
    symbol: "₿",
    name: "Crypto",
    description: "Follow digital assets and crypto markets.",
    examples: "BTC • ETH • SOL",
  },
  {
    symbol: "$",
    name: "Stocks",
    description: "Explore major global equities and indices.",
    examples: "AAPL • TSLA • NVDA",
  },
  {
    symbol: "FX",
    name: "Forex",
    description: "Monitor major currency pairs around the clock.",
    examples: "EUR/USD • GBP/USD • USD/JPY",
  },
];

export default function MarketsPreview() {
  return (
    <section id="markets" className="border-t border-white/[0.06] py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
            Markets
          </p>

          <h2 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            One platform.
            <br />
            Multiple markets.
          </h2>

          <p className="mt-5 leading-7 text-zinc-500">
            Keep your market activity in one streamlined environment built
            around speed, clarity, and control.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {markets.map((market) => (
            <div
              key={market.name}
              className="group rounded-3xl border border-white/[0.07] bg-white/[0.025] p-7 transition duration-300 hover:-translate-y-1 hover:border-emerald-500/20 hover:bg-emerald-500/[0.025]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 font-bold text-emerald-400">
                {market.symbol}
              </div>

              <h3 className="mt-7 text-xl font-semibold text-white">
                {market.name}
              </h3>

              <p className="mt-3 text-sm leading-6 text-zinc-500">
                {market.description}
              </p>

              <div className="mt-7 border-t border-white/[0.06] pt-5 text-xs font-medium text-zinc-400">
                {market.examples}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}