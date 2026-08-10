import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1fr_auto_auto]">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 font-black text-black">
                E
              </div>

              <span className="font-semibold text-white">
                Edge Portfolio
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-6 text-zinc-600">
              A modern trading platform for crypto, forex, and stock markets.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Platform
            </p>

            <div className="mt-4 flex flex-col gap-3">
              <Link
                href="/login"
                className="text-sm text-zinc-600 hover:text-white"
              >
                Login
              </Link>

              <Link
                href="/signup"
                className="text-sm text-zinc-600 hover:text-white"
              >
                Sign Up
              </Link>

              <Link
                href="/dashboard"
                className="text-sm text-zinc-600 hover:text-white"
              >
                Dashboard
              </Link>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Account
            </p>

            <div className="mt-4 flex flex-col gap-3">
              <Link
                href="/settings"
                className="text-sm text-zinc-600 hover:text-white"
              >
                Settings
              </Link>

              <Link
                href="/transactions"
                className="text-sm text-zinc-600 hover:text-white"
              >
                Transactions
              </Link>

              <Link
                href="/notifications"
                className="text-sm text-zinc-600 hover:text-white"
              >
                Notifications
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/[0.06] pt-7 text-xs text-zinc-700 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Edge Portfolio. All rights reserved.
          </p>

          <p>Trading involves risk. Markets can move rapidly.</p>
        </div>
      </div>
    </footer>
  );
}