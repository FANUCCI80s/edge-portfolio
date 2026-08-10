import Link from "next/link";

export default function CTASection() {
  return (
    <section className="border-t border-white/[0.06] py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-emerald-500/15 bg-emerald-500/[0.05] px-6 py-16 text-center sm:px-12">
          <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
              Edge Portfolio
            </p>

            <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Your next market opportunity starts here.
            </h2>

            <p className="mx-auto mt-5 max-w-xl leading-7 text-zinc-500">
              Create your account and experience the Edge Portfolio platform.
            </p>

            <div className="mt-9">
              <Link
                href="/signup"
                className="inline-flex rounded-2xl bg-emerald-500 px-7 py-4 text-sm font-bold text-black transition hover:bg-emerald-400"
              >
                Create Your Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}