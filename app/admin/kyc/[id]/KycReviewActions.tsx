"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function KycReviewActions({
kycId,
}: {
kycId: string;
}) {
const router = useRouter();

const [declineReason, setDeclineReason] =
useState("");

const [processing, setProcessing] =
useState(false);

const [error, setError] = useState("");

async function processKyc(
action: "APPROVE" | "DECLINE"
) {
setError("");

if (
  action === "DECLINE" &&
  !declineReason.trim()
) {
  setError(
    "Please provide a reason for declining this KYC."
  );
  return;
}

setProcessing(true);

try {
  const response = await fetch(
    `/api/admin/kyc/${kycId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action,
        declineReason:
          action === "DECLINE"
            ? declineReason.trim()
            : "",
      }),
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message ||
        "Unable to process KYC application."
    );
  }

  router.push("/admin/kyc");
  router.refresh();
} catch (reviewError) {
  setError(
    reviewError instanceof Error
      ? reviewError.message
      : "Unable to process KYC application."
  );
} finally {
  setProcessing(false);
}

}

function handleDecline(
event: FormEvent<HTMLFormElement>
) {
event.preventDefault();

processKyc("DECLINE");

}

return (
<section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
<div className="mb-6">
<p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-400">
Review decision
</p>

    <h2 className="mt-2 text-xl font-semibold">
      Process application
    </h2>

    <p className="mt-2 text-sm leading-6 text-zinc-500">
      Approve the verification if everything
      matches. If you decline it, provide a clear
      reason that the user can act on.
    </p>
  </div>

  {error && (
    <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-300">
      {error}
    </div>
  )}

  <button
    type="button"
    disabled={processing}
    onClick={() => processKyc("APPROVE")}
    className="w-full rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {processing
      ? "Processing..."
      : "Approve verification"}
  </button>

  <div className="my-6 h-px bg-white/10" />

  <form onSubmit={handleDecline}>
    <label
      htmlFor="declineReason"
      className="mb-2 block text-sm font-medium text-zinc-300"
    >
      Decline reason
    </label>

    <textarea
      id="declineReason"
      value={declineReason}
      onChange={(event) =>
        setDeclineReason(event.target.value)
      }
      disabled={processing}
      rows={5}
      maxLength={2000}
      placeholder="Explain what the applicant needs to correct before resubmitting."
      className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500/50 disabled:opacity-50"
    />

    <div className="mt-2 flex justify-end text-xs text-zinc-600">
      {declineReason.length}/2000
    </div>

    <button
      type="submit"
      disabled={processing}
      className="mt-4 w-full rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {processing
        ? "Processing..."
        : "Decline verification"}
    </button>
  </form>
</section>

);
}