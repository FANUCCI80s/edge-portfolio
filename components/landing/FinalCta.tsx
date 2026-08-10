import Link from "next/link";

export default function FinalCta() {
  return (
    <section className="border-t border-white/[0.06] py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-emerald-500/20 bg-emerald-500/[0.05] px-6 py-20 text-center sm:px-12">
          <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="absolute bottom-0 left-1/2 h-48 w-48 -translate-x-1/2 translate-y-1/2 rounded-full bg-emerald-500/[0.07] blur-3xl" />

          <div className="relative">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 font-black text-black shadow-[0_0_35px_rgba(16,185,129,0.2)]">
              E
            </div>

            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
              Edge Portfolio
            </p>

            <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Build your edge in the markets.
            </h2>

            <p className="mx-auto mt-6 max-w-xl leading-7 text-zinc-500">
              Create your Edge Portfolio account and access a modern
              environment for managing your market journey.
            </p>

            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="rounded-2xl bg-emerald-500 px-7 py-4 text-sm font-bold text-black transition hover:bg-emerald-400"
              >
                Create Your Account
              </Link>

              <Link
                href="/login"
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-7 py-4 text-sm font-semibold text-white transition hover:bg-white/[0.06]"
              >
                Log In
              </Link>
            </div>

            <p className="mt-7 text-[11px] text-zinc-700">
              Market activity involves risk. Past performance does not
              guarantee future results.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}