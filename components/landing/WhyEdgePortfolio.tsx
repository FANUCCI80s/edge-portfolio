const features = [
  {
    number: "01",
    title: "Built for clarity",
    text: "A clean interface keeps important account and market information easy to understand.",
  },
  {
    number: "02",
    title: "Account control",
    text: "Manage your account, deposits, withdrawals, verification, and trading activity from one place.",
  },
  {
    number: "03",
    title: "Security focused",
    text: "Authentication, verification, sessions, and account controls are built into the platform architecture.",
  },
  {
    number: "04",
    title: "Designed to scale",
    text: "The platform is structured to grow with additional markets, features, and trading tools.",
  },
];

export default function WhyEdgePortfolio() {
  return (
    <section id="why-edge" className="border-t border-white/[0.06] py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
              Why Edge Portfolio
            </p>

            <h2 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              A trading experience built around you.
            </h2>

            <p className="mt-6 max-w-lg leading-7 text-zinc-500">
              From account onboarding to market activity, Edge Portfolio is
              designed to make the experience straightforward without
              sacrificing the tools you need.
            </p>

            <div className="mt-8 h-px w-24 bg-emerald-500/50" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature.number}
                className="rounded-3xl border border-white/[0.07] bg-white/[0.02] p-7"
              >
                <span className="text-xs font-semibold text-emerald-500">
                  {feature.number}
                </span>

                <h3 className="mt-5 text-lg font-semibold text-white">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-zinc-500">
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}