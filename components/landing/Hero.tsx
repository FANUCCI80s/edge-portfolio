import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(16,185,129,0.14),transparent_35%)]" />

      <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-emerald-500/[0.05] blur-3xl" />

      <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:60px_60px]" />

      <div className="relative mx-auto w-full max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.07] px-4 py-2 text-xs font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            Trade smarter. Move with the markets.
          </div>

          <h1 className="text-5xl font-bold tracking-[-0.04em] text-white sm:text-6xl lg:text-8xl">
            Your edge in
            <span className="block bg-gradient-to-r from-emerald-300 via-emerald-400 to-green-500 bg-clip-text text-transparent">
              global markets.
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
            Edge Portfolio gives you a modern environment to access crypto,
            forex, and stock markets with powerful tools built around your
            trading journey.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-2xl bg-emerald-500 px-7 py-4 text-sm font-bold text-black shadow-[0_0_40px_rgba(16,185,129,0.18)] transition hover:-translate-y-0.5 hover:bg-emerald-400"
            >
              Start Trading
            </Link>

            <Link
              href="/login"
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-7 py-4 text-sm font-semibold text-white transition hover:bg-white/[0.06]"
            >
              Access Your Account
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-20 max-w-6xl">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#090c0a]/90 p-3 shadow-2xl shadow-black/40">
            <div className="rounded-2xl border border-white/[0.06] bg-[#070908]">
              <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-medium text-zinc-400">
                    Edge Portfolio Markets
                  </span>
                </div>

                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-medium text-emerald-400">
                  LIVE MARKETS
                </span>
              </div>

              <div className="grid gap-px bg-white/[0.04] md:grid-cols-3">
                {[
                  ["BTC/USD", "$67,842.21", "+2.84%"],
                  ["EUR/USD", "1.1742", "+0.31%"],
                  ["S&P 500", "6,482.17", "+1.08%"],
                ].map(([name, price, change]) => (
                  <div
                    key={name}
                    className="bg-[#070908] p-6 transition hover:bg-[#0a0e0b]"
                  >
                    <p className="text-xs text-zinc-500">{name}</p>
                    <p className="mt-3 text-2xl font-semibold text-white">
                      {price}
                    </p>
                    <p className="mt-2 text-xs font-medium text-emerald-400">
                      {change}
                    </p>

                    <div className="mt-5 flex h-12 items-end gap-1">
                      {[20, 35, 25, 42, 30, 50, 38, 58, 46, 65, 55, 72].map(
                        (height, index) => (
                          <div
                            key={index}
                            className="flex-1 rounded-t bg-emerald-500/30"
                            style={{ height: `${height}%` }}
                          />
                        ),
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-8 border-t border-white/[0.06] pt-10 sm:grid-cols-4">
          {[
            ["3+", "Market categories"],
            ["24/7", "Market access"],
            ["Secure", "Account infrastructure"],
            ["Real-time", "Market monitoring"],
          ].map(([value, label]) => (
            <div key={label} className="text-center">
              <p className="text-xl font-bold text-white">{value}</p>
              <p className="mt-1 text-xs text-zinc-500">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}