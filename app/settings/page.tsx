
import Link from "next/link";
import { requireAuthenticatedPage } from "@/lib/auth/guards";

export default async function SettingsPage() {
  const user = await requireAuthenticatedPage();

  const firstName = user.firstName || "Trader";
  const lastName = user.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();

  return (
    <main className="min-h-screen bg-[#080a09] text-white">
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-[#080a09] lg:flex">
          <div className="border-b border-white/10 p-5">
            <Link
              href="/dashboard"
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/10">
                <span className="font-bold text-emerald-400">
                  E
                </span>
              </div>

              <div>
                <p className="font-semibold tracking-tight">
                  Edge Portfolio
                </p>

                <p className="text-xs text-zinc-500">
                  Trading platform
                </p>
              </div>
            </Link>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              <span>⌂</span>
              Dashboard
            </Link>

            <Link
              href="/trade"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              <span>↗</span>
              Trade
            </Link>

            <Link
              href="/deposit"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              <span>↓</span>
              Deposit
            </Link>

            <Link
              href="/withdraw"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              <span>↑</span>
              Withdraw
            </Link>

            <Link
              href="/transactions"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              <span>↔</span>
              Transactions
            </Link>

            <div className="my-5 border-t border-white/10" />

            <Link
              href="/notifications"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              <span>●</span>
              Notifications
            </Link>

            <Link
              href="/settings"
              className="flex items-center gap-3 rounded-xl bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-400"
            >
              <span>⚙</span>
              Settings
            </Link>
          </nav>

          <div className="border-t border-white/10 p-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-xs text-zinc-600">
                Signed in as
              </p>

              <p className="mt-1 truncate text-sm font-medium">
                {user.email}
              </p>
            </div>
          </div>
        </aside>

        {/* Main */}
        <section className="min-w-0 flex-1">
          {/* Mobile / Tablet Header */}
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
                Account settings
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                Settings
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                Manage your profile, account security, notifications,
                and verification details.
              </p>
            </div>

            {/* Profile */}
            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10 text-2xl font-semibold text-emerald-400">
                  {firstName.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <p className="text-sm text-zinc-500">
                    Profile
                  </p>

                  <h2 className="mt-1 text-xl font-semibold">
                    {fullName || "Your profile"}
                  </h2>

                  <p className="mt-1 truncate text-sm text-zinc-500">
                    {user.email}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-emerald-400/30 hover:bg-emerald-400/[0.05] hover:text-white"
                    >
                      Change profile picture
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Account Information */}
            <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <div>
                <p className="text-sm text-zinc-500">
                  Personal information
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  Account information
                </h2>

                <p className="mt-2 text-sm text-zinc-600">
                  Your account information is associated with your
                  Edge Portfolio profile.
                </p>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-zinc-300">
                    First name
                  </label>

                  <div className="mt-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-400">
                    {firstName}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-zinc-300">
                    Last name
                  </label>

                  <div className="mt-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-400">
                    {lastName || "Not provided"}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-zinc-300">
                    Email address
                  </label>

                  <div className="mt-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-400">
                    {user.email}
                  </div>
                </div>
              </div>
            </section>

            {/* Security */}
            <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <div>
                <p className="text-sm text-zinc-500">
                  Security
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  Account security
                </h2>

                <p className="mt-2 text-sm text-zinc-600">
                  Keep your Edge Portfolio account secure.
                </p>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/20 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">
                      Password
                    </p>

                    <p className="mt-1 text-sm text-zinc-600">
                      Change your account password.
                    </p>
                  </div>

                  <Link
                    href="/settings/password"
                    className="w-fit rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-emerald-400/30 hover:text-white"
                  >
                    Change password
                  </Link>
                </div>

                <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/20 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">
                      Email verification
                    </p>

                    <p className="mt-1 text-sm text-zinc-600">
                      Your account email is used for account
                      security and login verification.
                    </p>
                  </div>

                  <span className="w-fit rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-400">
                    Active
                  </span>
                </div>

                <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/20 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">
                      New-device verification
                    </p>

                    <p className="mt-1 text-sm text-zinc-600">
                      New devices require email OTP verification.
                    </p>
                  </div>

                  <span className="w-fit rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-400">
                    Enabled
                  </span>
                </div>
              </div>
            </section>

            {/* Notifications */}
            <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <div>
                <p className="text-sm text-zinc-500">
                  Notifications
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  Notification preferences
                </h2>

                <p className="mt-2 text-sm text-zinc-600">
                  Manage the account alerts and messages you
                  receive.
                </p>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div>
                    <p className="text-sm font-medium">
                      Account alerts
                    </p>

                    <p className="mt-1 text-xs text-zinc-600">
                      Important updates about your account.
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-400">
                    On
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div>
                    <p className="text-sm font-medium">
                      Admin messages
                    </p>

                    <p className="mt-1 text-xs text-zinc-600">
                      Messages sent directly by Edge Portfolio.
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-400">
                    On
                  </span>
                </div>
              </div>

              <Link
                href="/notifications"
                className="mt-5 inline-block text-sm text-emerald-400 transition hover:text-emerald-300"
              >
                View notifications →
              </Link>
            </section>

            {/* KYC */}
            <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-zinc-500">
                    Identity
                  </p>

                  <h2 className="mt-1 text-xl font-semibold">
                    KYC verification
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-600">
                    Identity verification helps keep your account
                    secure and enables access to supported platform
                    features.
                  </p>
                </div>

                <span
                  className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${
                    user.kyc?.status === "APPROVED"
                      ? "bg-emerald-400/10 text-emerald-400"
                      : user.kyc?.status === "DECLINED"
                        ? "bg-red-400/10 text-red-400"
                        : "bg-yellow-400/10 text-yellow-400"
                  }`}
                >
                  {user.kyc?.status === "APPROVED"
                    ? "Approved"
                    : user.kyc?.status === "DECLINED"
                      ? "Declined"
                      : "Pending"}
                </span>
              </div>
            </section>

            {/* Account Navigation */}
            <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <p className="text-sm text-zinc-500">
                Account
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                Account management
              </h2>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link
                  href="/dashboard"
                  className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-emerald-400/30 hover:bg-emerald-400/[0.04]"
                >
                  <p className="font-medium">
                    Dashboard
                  </p>

                  <p className="mt-1 text-sm text-zinc-600">
                    Return to your account overview.
                  </p>
                </Link>

                <Link
                  href="/transactions"
                  className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-emerald-400/30 hover:bg-emerald-400/[0.04]"
                >
                  <p className="font-medium">
                    Transactions
                  </p>

                  <p className="mt-1 text-sm text-zinc-600">
                    Review your account activity.
                  </p>
                </Link>

                <Link
                  href="/notifications"
                  className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-emerald-400/30 hover:bg-emerald-400/[0.04]"
                >
                  <p className="font-medium">
                    Notifications
                  </p>

                  <p className="mt-1 text-sm text-zinc-600">
                    View account messages and alerts.
                  </p>
                </Link>

                <Link
                  href="/kyc"
                  className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-emerald-400/30 hover:bg-emerald-400/[0.04]"
                >
                  <p className="font-medium">
                    Identity verification
                  </p>

                  <p className="mt-1 text-sm text-zinc-600">
                    View and manage your KYC status.
                  </p>
                </Link>
              </div>
            </section>

            <p className="mt-8 text-center text-xs text-zinc-700">
              Edge Portfolio • Account Settings
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

