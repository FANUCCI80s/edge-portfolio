
import Link from "next/link";
import { requireUser } from "@/lib/auth/session";

export default async function KycStatusPage() {
  const user = await requireUser();

  const kyc = user.kyc;

  if (!kyc) {
    return (
      <main className="min-h-screen bg-[#050807] px-5 py-10 text-white">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <p className="text-xl font-semibold tracking-tight">
                Edge Portfolio
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Identity verification
              </p>
            </div>
          </div>

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-10">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">
              <span className="text-2xl text-emerald-400">!</span>
            </div>

            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-emerald-400">
              Verification
            </p>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Start your verification
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-400">
              Your KYC verification has not been started yet. Complete the
              verification process to continue.
            </p>

            <Link
              href="/kyc"
              className="mt-8 inline-flex rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400"
            >
              Start verification
            </Link>
          </section>
        </div>
      </main>
    );
  }

  const status = kyc.status;

  return (
    <main className="min-h-screen bg-[#050807] px-5 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <p className="text-xl font-semibold tracking-tight">
              Edge Portfolio
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              Identity verification
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.05] hover:text-white"
          >
            Dashboard
          </Link>
        </header>

        {status === "PENDING" && (
          <section className="rounded-3xl border border-amber-500/20 bg-amber-500/[0.04] p-6 sm:p-10">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10">
              <span className="text-2xl text-amber-400">⌛</span>
            </div>

            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-amber-400">
              Verification pending
            </p>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Your KYC is under review
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
              We have received your verification documents. Our verification
              team is reviewing the information you submitted.
            </p>

            <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-sm font-medium text-zinc-200">
                What happens next?
              </p>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                You will be notified once your verification has been reviewed.
                Please do not submit another verification while your current
                submission is under review.
              </p>
            </div>
          </section>
        )}

        {status === "APPROVED" && (
          <section className="rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.04] p-6 sm:p-10">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">
              <span className="text-2xl text-emerald-400">✓</span>
            </div>

            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-emerald-400">
              Verification approved
            </p>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Your identity has been verified
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
              Your KYC verification has been approved. Your account can now
              access features that require verified identity.
            </p>

            <Link
              href="/dashboard"
              className="mt-8 inline-flex rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400"
            >
              Go to dashboard
            </Link>
          </section>
        )}

        {status === "DECLINED" && (
          <section className="rounded-3xl border border-red-500/20 bg-red-500/[0.04] p-6 sm:p-10">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
              <span className="text-2xl text-red-400">!</span>
            </div>

            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-red-400">
              Verification declined
            </p>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              We need you to resubmit your verification
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
              Your previous KYC submission was reviewed and could not be
              approved. Please review the reason below and submit your
              verification again.
            </p>

            <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-5">
              <p className="text-sm font-semibold text-red-300">
                Reason for decline
              </p>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                {kyc.declineReason ||
                  "No specific reason was provided. Please review your information and documents carefully before resubmitting."}
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-sm font-medium text-zinc-200">
                Before resubmitting
              </p>

              <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-500">
                <li>• Make sure your personal information is accurate.</li>
                <li>• Make sure your ID number is correct.</li>
                <li>• Upload clear images of both sides of your ID.</li>
                <li>• Make sure the document has not expired.</li>
              </ul>
            </div>

            <Link
              href="/kyc"
              className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400 sm:w-auto"
            >
              Resubmit verification
            </Link>
          </section>
        )}

        {status === "NOT_STARTED" && (
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-10">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">
              <span className="text-2xl text-emerald-400">→</span>
            </div>

            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-emerald-400">
              Verification required
            </p>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Complete your identity verification
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
              Complete your KYC verification to help us verify your identity
              and protect your Edge Portfolio account.
            </p>

            <Link
              href="/kyc"
              className="mt-8 inline-flex rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400"
            >
              Start verification
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}

