import Link from "next/link";
import { requireAuthenticatedPage } from "@/lib/auth/guards";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
const user = await requireAuthenticatedPage();

const firstName = user.firstName || "Trader";

// Load the exact same balance record used by
// the admin balance management system.
const balance = await prisma.balance.findUnique({
where: {
userId: user.id,
},
select: {
available: true,
locked: true,
updatedAt: true,
},
});

const availableBalance = balance?.available ?? 0;
const lockedBalance = balance?.locked ?? 0;

const availableBalanceNumber = Number(availableBalance);
const lockedBalanceNumber = Number(lockedBalance);

const totalAccountValue =
availableBalanceNumber + lockedBalanceNumber;

return ( <main className="min-h-screen bg-[#080a09] text-white">
{/* Responsive Navigation */} <DashboardNav />


  <div className="flex min-h-screen">
    {/* Main */}
    <section className="min-w-0 flex-1">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        {/* Welcome */}
        <div className="mb-8">
          <p className="text-sm font-medium text-emerald-400">
            Account overview
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Welcome back, {firstName}
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Monitor your portfolio, manage funds,
            and access the markets.
          </p>
        </div>

        {/* Balance cards */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* Available Balance */}
          <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/[0.06] p-6">
            <p className="text-sm text-zinc-500">
              Available balance
            </p>

            <p className="mt-3 text-3xl font-semibold tracking-tight">
              $
              {availableBalanceNumber.toLocaleString(
                "en-US",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}
            </p>

            <p className="mt-2 text-xs text-zinc-600">
              Available for trading and withdrawals
            </p>
          </div>

          {/* Portfolio Value */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-zinc-500">
              Portfolio value
            </p>

            <p className="mt-3 text-3xl font-semibold tracking-tight">
              $
              {totalAccountValue.toLocaleString(
                "en-US",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}
            </p>

            <p className="mt-2 text-xs text-zinc-600">
              Current value of your holdings
            </p>
          </div>

          {/* Active Trades */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-zinc-500">
              Active trades
            </p>

            <p className="mt-3 text-3xl font-semibold tracking-tight">
              0
            </p>

            <p className="mt-2 text-xs text-zinc-600">
              Currently open positions
            </p>
          </div>

          {/* Total P/L */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-zinc-500">
              Total profit/loss
            </p>

            <p className="mt-3 text-3xl font-semibold tracking-tight">
              $0.00
            </p>

            <p className="mt-2 text-xs text-zinc-600">
              Overall trading performance
            </p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-8">
          <div className="mb-4">
            <p className="text-sm text-zinc-500">
              Quick actions
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              Manage your account
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Link
              href="/deposit"
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-emerald-400/30 hover:bg-emerald-400/[0.05]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400">
                ↓
              </div>

              <h3 className="mt-4 font-medium">
                Deposit funds
              </h3>

              <p className="mt-1 text-sm text-zinc-600">
                Add funds to your trading account.
              </p>

              <span className="mt-4 inline-block text-sm text-emerald-400">
                Make a deposit →
              </span>
            </Link>

            <Link
              href="/withdraw"
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-emerald-400/30 hover:bg-emerald-400/[0.05]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.05] text-zinc-300">
                ↑
              </div>

              <h3 className="mt-4 font-medium">
                Withdraw funds
              </h3>

              <p className="mt-1 text-sm text-zinc-600">
                Request a withdrawal from your account.
              </p>

              <span className="mt-4 inline-block text-sm text-emerald-400">
                Request withdrawal →
              </span>
            </Link>

            {/* Market Watchlist */}
            <Link
              href="/market-watchlist"
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-emerald-400/30 hover:bg-emerald-400/[0.05]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.05] text-zinc-300">
                ↗
              </div>

              <h3 className="mt-4 font-medium">
                Market Watchlist
              </h3>

              <p className="mt-1 text-sm text-zinc-600">
                Track cryptocurrency, forex, and stock
                markets.
              </p>

              <span className="mt-4 inline-block text-sm text-emerald-400">
                View markets →
              </span>
            </Link>

            <Link
              href="/transactions"
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-emerald-400/30 hover:bg-emerald-400/[0.05]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.05] text-zinc-300">
                ↔
              </div>

              <h3 className="mt-4 font-medium">
                Transactions
              </h3>

              <p className="mt-1 text-sm text-zinc-600">
                Review your deposits, withdrawals,
                and trades.
              </p>

              <span className="mt-4 inline-block text-sm text-emerald-400">
                View transactions →
              </span>
            </Link>
          </div>
        </div>

        {/* Portfolio section */}
        <div className="mt-8 grid gap-6 xl:grid-cols-3">
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 xl:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">
                  Portfolio
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  Your holdings
                </h2>
              </div>

              <Link
                href="/market-watchlist"
                className="text-sm text-emerald-400 hover:text-emerald-300"
              >
                Markets →
              </Link>
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-black/20 p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.05] text-zinc-500">
                +
              </div>

              <h3 className="mt-4 font-medium">
                No holdings yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">
                Once you start investing, your
                cryptocurrency, forex, and stock
                positions will appear here.
              </p>

              <Link
                href="/market-watchlist"
                className="mt-5 inline-block rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400"
              >
                Explore markets
              </Link>
            </div>
          </section>

          {/* Account status */}
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-zinc-500">
              Account
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              Account status
            </h2>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4">
                <div>
                  <p className="text-sm font-medium">
                    Email
                  </p>

                  <p className="mt-1 text-xs text-zinc-600">
                    {user.email}
                  </p>
                </div>

                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-400">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4">
                <div>
                  <p className="text-sm font-medium">
                    KYC
                  </p>

                  <p className="mt-1 text-xs text-zinc-600">
                    Identity verification
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    user.kyc?.status === "APPROVED"
                      ? "bg-emerald-400/10 text-emerald-400"
                      : "bg-yellow-400/10 text-yellow-400"
                  }`}
                >
                  {user.kyc?.status === "APPROVED"
                    ? "Approved"
                    : "Pending"}
                </span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-medium">
                  Market access
                </p>

                <p className="mt-1 text-xs leading-5 text-zinc-600">
                  Monitor cryptocurrency, forex, and
                  stock markets from your watchlist.
                </p>

                <Link
                  href="/trade"
                  className="mt-4 inline-block text-sm text-emerald-400 hover:text-emerald-300"
                >
                  View market watchlist →
                </Link>
              </div>
            </div>
          </section>
        </div>

        {/* Recent activity */}
        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500">
                Activity
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                Recent activity
              </h2>
            </div>

            <Link
              href="/transactions"
              className="text-sm text-emerald-400 hover:text-emerald-300"
            >
              View all →
            </Link>
          </div>

          <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-black/20 p-8 text-center">
            <p className="text-sm text-zinc-500">
              No recent activity
            </p>

            <p className="mt-1 text-xs text-zinc-700">
              Your latest account activity will appear
              here.
            </p>
          </div>
        </section>
      </div>
    </section>
  </div>
</main>


);
}
