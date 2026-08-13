"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

type DepositStatus =
  | "PENDING"
  | "APPROVED"
  | "DECLINED";

type DepositMethod =
  | "BANK_TRANSFER"
  | "CARD"
  | "CRYPTOCURRENCY"
  | "CASH_APP"
  | "PAYPAL"
  | "ZELLE"
  | "VENMO";

type Deposit = {
  id: string;
  userId: string;
  method: DepositMethod;
  status: DepositStatus;
  amount: string | number;
  reference: string | null;
  notes: string | null;
  declineReason: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;

  selectedBankName: string | null;
  selectedAccountName: string | null;
  selectedAccountNumber: string | null;
  selectedRoutingNumber: string | null;
  selectedSwiftBic: string | null;
  selectedBankAddress: string | null;

  cryptoAsset: string | null;
  cryptoSymbol: string | null;
  cryptoNetwork: string | null;
  cryptoWalletAddress: string | null;

  paymentInformation: string | null;

  proofFileId: string | null;
  invoiceFileId: string | null;

  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    status: string;
    createdAt: string;
  };

  bankAccount: {
    id: string;
    accountName: string;
    bankName: string;
    accountNumber: string;
    routingNumber: string | null;
    swiftBic: string | null;
    bankAddress: string | null;
    instructions: string | null;
    isEnabled: boolean;
  } | null;

  cryptoOption: {
    id: string;
    asset: string;
    symbol: string;
    network: string;
    walletAddress: string;
    instructions: string | null;
    isEnabled: boolean;
  } | null;

  paymentConfig: {
    id: string;
    method: string;
    paymentInformation: string;
    instructions: string | null;
    isEnabled: boolean;
  } | null;

  proofFile: {
    id: string;
    originalName: string;
    storageKey: string;
    mimeType: string;
    sizeBytes: number;
    createdAt: string;
  } | null;

  invoiceFile: {
    id: string;
    originalName: string;
    storageKey: string;
    mimeType: string;
    sizeBytes: number;
    createdAt: string;
  } | null;

  transactions: {
    id: string;
    type: string;
    status: string;
    amount: string | number;
    currency: string;
    description: string | null;
    reference: string | null;
    completedAt: string | null;
    createdAt: string;
  }[];
};

type ApiResponse = {
  success?: boolean;
  deposit?: Deposit;
  error?: string;
  message?: string;
};

function formatAmount(
  amount: string | number
) {
  const numeric =
    typeof amount === "number"
      ? amount
      : Number(amount);

  if (!Number.isFinite(numeric)) {
    return "$0.00";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  }).format(numeric);
}

function formatDate(
  date: string | null | undefined
) {
  if (!date) {
    return "—";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function methodLabel(
  method: string | null | undefined
) {
  if (!method) {
    return "—";
  }

  switch (method) {
    case "BANK_TRANSFER":
      return "Bank Transfer";

    case "CARD":
      return "Card";

    case "CRYPTOCURRENCY":
      return "Cryptocurrency";

    case "CASH_APP":
      return "Cash App";

    case "PAYPAL":
      return "PayPal";

    case "ZELLE":
      return "Zelle";

    case "VENMO":
      return "Venmo";

    default:
      return method
        .toLowerCase()
        .split("_")
        .map(
          (word) =>
            word.charAt(0).toUpperCase() +
            word.slice(1)
        )
        .join(" ");
  }
}

function statusClass(
  status: string
) {
  switch (status) {
    case "PENDING":
      return "border-yellow-500/20 bg-yellow-500/10 text-yellow-400";

    case "APPROVED":
    case "COMPLETED":
      return "border-green-500/20 bg-green-500/10 text-green-400";

    case "DECLINED":
    case "FAILED":
      return "border-red-500/20 bg-red-500/10 text-red-400";

    default:
      return "border-white/10 bg-white/5 text-gray-400";
  }
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value:
    | string
    | number
    | null
    | undefined;
}) {
  return (
    <div className="border-b border-white/5 py-4 last:border-b-0">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
        {label}
      </p>

      <p className="mt-1 break-words text-sm text-white">
        {value === null ||
        value === undefined ||
        value === ""
          ? "—"
          : value}
      </p>
    </div>
  );
}

export default function AdminDepositReviewPage() {
  const params = useParams();
  const router = useRouter();

  const depositId = String(params.id);

  const [deposit, setDeposit] =
    useState<Deposit | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  const [showDeclineBox, setShowDeclineBox] =
    useState(false);

  const [declineReason, setDeclineReason] =
    useState("");

  const loadDeposit = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/admin/deposit/${depositId}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const data: ApiResponse =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              data.message ||
              "Unable to load deposit."
          );
        }

        setDeposit(data.deposit || null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load deposit."
        );
      } finally {
        setLoading(false);
      }
    },
    [depositId]
  );

  useEffect(() => {
    loadDeposit();
  }, [loadDeposit]);

  async function reviewDeposit(
    action: "APPROVE" | "DECLINE"
  ) {
    if (!deposit) {
      return;
    }

    if (
      action === "DECLINE" &&
      !declineReason.trim()
    ) {
      setError(
        "Please provide a reason for declining this deposit."
      );

      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await fetch(
        `/api/admin/deposit/${deposit.id}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            action,

            reason:
              action === "DECLINE"
                ? declineReason.trim()
                : undefined,
          }),
        }
      );

      const data: ApiResponse =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Unable to review deposit."
        );
      }

      router.push("/admin/deposits");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to review deposit."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050806] text-white">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center text-gray-500">
            Loading deposit request...
          </div>
        </div>
      </main>
    );
  }

  if (error && !deposit) {
    return (
      <main className="min-h-screen bg-[#050806] text-white">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <Link
            href="/admin/deposits"
            className="text-sm text-green-400 hover:text-green-300"
          >
            ← Back to deposits
          </Link>

          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-400">
            {error}
          </div>
        </div>
      </main>
    );
  }

  if (!deposit) {
    return (
      <main className="min-h-screen bg-[#050806] text-white">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <p className="text-gray-500">
            Deposit request not found.
          </p>
        </div>
      </main>
    );
  }

  const isPending =
    deposit.status === "PENDING";

  const latestTransaction =
    deposit.transactions?.[0] || null;

  return (
    <main className="min-h-screen bg-[#050806] text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <Link
            href="/admin/deposits"
            className="text-sm text-green-400 transition hover:text-green-300"
          >
            ← Back to deposit requests
          </Link>

          <div className="mt-5 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-medium text-green-400">
                Deposit Review
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                Deposit Request
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Review the user's submitted deposit information
                before approving or declining the request.
              </p>
            </div>

            <span
              className={`inline-flex w-fit rounded-full border px-4 py-2 text-sm font-semibold ${statusClass(
                deposit.status
              )}`}
            >
              {deposit.status}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-lg font-semibold">
                Deposit Information
              </h2>

              <div className="mt-4 grid gap-x-8 md:grid-cols-2">
                <DetailRow
                  label="Deposit ID"
                  value={deposit.id}
                />

                <DetailRow
                  label="Status"
                  value={deposit.status}
                />

                <DetailRow
                  label="Amount"
                  value={formatAmount(
                    deposit.amount
                  )}
                />

                <DetailRow
                  label="Method"
                  value={methodLabel(
                    deposit.method
                  )}
                />

                <DetailRow
                  label="Reference"
                  value={deposit.reference}
                />

                <DetailRow
                  label="Submitted"
                  value={formatDate(
                    deposit.createdAt
                  )}
                />

                <DetailRow
                  label="Reviewed"
                  value={formatDate(
                    deposit.reviewedAt
                  )}
                />

                <DetailRow
                  label="Notes"
                  value={deposit.notes}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-lg font-semibold">
                User Information
              </h2>

              <div className="mt-4 grid gap-x-8 md:grid-cols-2">
                <DetailRow
                  label="Full Name"
                  value={`${deposit.user.firstName} ${deposit.user.lastName}`}
                />

                <DetailRow
                  label="Email"
                  value={deposit.user.email}
                />

                <DetailRow
                  label="Phone"
                  value={deposit.user.phone}
                />

                <DetailRow
                  label="Account Status"
                  value={deposit.user.status}
                />

                <DetailRow
                  label="User Since"
                  value={formatDate(
                    deposit.user.createdAt
                  )}
                />

                <div className="border-b border-white/5 py-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    User Profile
                  </p>

                  <Link
                    href={`/admin/users/${deposit.user.id}`}
                    className="mt-1 inline-block text-sm text-green-400 hover:text-green-300"
                  >
                    View user profile →
                  </Link>
                </div>
              </div>
            </section>

            {deposit.method ===
              "BANK_TRANSFER" && (
              <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <h2 className="text-lg font-semibold">
                  Bank Transfer Details
                </h2>

                <div className="mt-4 grid gap-x-8 md:grid-cols-2">
                  <DetailRow
                    label="Bank Name"
                    value={
                      deposit.selectedBankName ||
                      deposit.bankAccount?.bankName
                    }
                  />

                  <DetailRow
                    label="Account Name"
                    value={
                      deposit.selectedAccountName ||
                      deposit.bankAccount?.accountName
                    }
                  />

                  <DetailRow
                    label="Account Number"
                    value={
                      deposit.selectedAccountNumber ||
                      deposit.bankAccount?.accountNumber
                    }
                  />

                  <DetailRow
                    label="Routing Number"
                    value={
                      deposit.selectedRoutingNumber ||
                      deposit.bankAccount?.routingNumber
                    }
                  />

                  <DetailRow
                    label="SWIFT / BIC"
                    value={
                      deposit.selectedSwiftBic ||
                      deposit.bankAccount?.swiftBic
                    }
                  />

                  <DetailRow
                    label="Bank Address"
                    value={
                      deposit.selectedBankAddress ||
                      deposit.bankAccount?.bankAddress
                    }
                  />
                </div>

                {deposit.bankAccount
                  ?.instructions && (
                  <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      Admin Bank Instructions
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-300">
                      {
                        deposit.bankAccount
                          .instructions
                      }
                    </p>
                  </div>
                )}
              </section>
            )}

            {deposit.method ===
              "CRYPTOCURRENCY" && (
              <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <h2 className="text-lg font-semibold">
                  Cryptocurrency Details
                </h2>

                <div className="mt-4 grid gap-x-8 md:grid-cols-2">
                  <DetailRow
                    label="Asset"
                    value={
                      deposit.cryptoAsset ||
                      deposit.cryptoOption?.asset
                    }
                  />

                  <DetailRow
                    label="Symbol"
                    value={
                      deposit.cryptoSymbol ||
                      deposit.cryptoOption?.symbol
                    }
                  />

                  <DetailRow
                    label="Network"
                    value={
                      deposit.cryptoNetwork ||
                      deposit.cryptoOption?.network
                    }
                  />

                  <DetailRow
                    label="Wallet Address"
                    value={
                      deposit.cryptoWalletAddress ||
                      deposit.cryptoOption
                        ?.walletAddress
                    }
                  />
                </div>

                {deposit.cryptoOption
                  ?.instructions && (
                  <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      Crypto Instructions
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-300">
                      {
                        deposit.cryptoOption
                          .instructions
                      }
                    </p>
                  </div>
                )}
              </section>
            )}

            {deposit.method !==
              "BANK_TRANSFER" &&
              deposit.method !==
                "CRYPTOCURRENCY" && (
                <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <h2 className="text-lg font-semibold">
                    Payment Information
                  </h2>

                  <div className="mt-4">
                    <DetailRow
                      label="Payment Information"
                      value={
                        deposit.paymentInformation ||
                        deposit.paymentConfig
                          ?.paymentInformation
                      }
                    />
                  </div>

                  {deposit.paymentConfig
                    ?.instructions && (
                    <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                        Payment Instructions
                      </p>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-300">
                        {
                          deposit.paymentConfig
                            .instructions
                        }
                      </p>
                    </div>
                  )}
                </section>
              )}

            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-lg font-semibold">
                Submitted Proof
              </h2>

              <div className="mt-4 space-y-4">
                {deposit.proofFile ? (
                  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                      <div>
                        <p className="font-medium text-white">
                          Deposit Proof
                        </p>

                        <p className="mt-1 break-all text-sm text-gray-500">
                          {
                            deposit.proofFile
                              .originalName
                          }
                        </p>

                        <p className="mt-1 text-xs text-gray-600">
                          {deposit.proofFile.mimeType} ·{" "}
                          {Math.round(
                            deposit.proofFile
                              .sizeBytes /
                              1024
                          )}{" "}
                          KB
                        </p>
                      </div>

                      <span className="rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2 text-xs font-semibold text-green-400">
                        Uploaded
                      </span>
                    </div>

                    <p className="mt-3 break-all text-xs text-gray-600">
                      File ID:{" "}
                      {deposit.proofFile.id}
                    </p>
                  </div>
                ) : deposit.proofFileId ? (
                  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <p className="font-medium text-white">
                      Deposit Proof
                    </p>

                    <p className="mt-2 break-all text-xs text-gray-500">
                      File ID:{" "}
                      {deposit.proofFileId}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No deposit proof was uploaded.
                  </p>
                )}

                {deposit.invoiceFile ? (
                  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                      <div>
                        <p className="font-medium text-white">
                          Payment Invoice
                        </p>

                        <p className="mt-1 break-all text-sm text-gray-500">
                          {
                            deposit.invoiceFile
                              .originalName
                          }
                        </p>

                        <p className="mt-1 text-xs text-gray-600">
                          {
                            deposit.invoiceFile
                              .mimeType
                          }{" "}
                          ·{" "}
                          {Math.round(
                            deposit.invoiceFile
                              .sizeBytes /
                              1024
                          )}{" "}
                          KB
                        </p>
                      </div>

                      <span className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-400">
                        Uploaded
                      </span>
                    </div>

                    <p className="mt-3 break-all text-xs text-gray-600">
                      File ID:{" "}
                      {deposit.invoiceFile.id}
                    </p>
                  </div>
                ) : deposit.invoiceFileId ? (
                  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <p className="font-medium text-white">
                      Payment Invoice
                    </p>

                    <p className="mt-2 break-all text-xs text-gray-500">
                      File ID:{" "}
                      {deposit.invoiceFileId}
                    </p>
                  </div>
                ) : null}
              </div>
            </section>

            {deposit.declineReason && (
              <section className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
                <h2 className="text-lg font-semibold text-red-400">
                  Decline Reason
                </h2>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-300">
                  {deposit.declineReason}
                </p>
              </section>
            )}

            {latestTransaction && (
              <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <h2 className="text-lg font-semibold">
                  Related Transaction
                </h2>

                <div className="mt-4 grid gap-x-8 md:grid-cols-2">
                  <DetailRow
                    label="Transaction ID"
                    value={
                      latestTransaction.id
                    }
                  />

                  <DetailRow
                    label="Transaction Status"
                    value={
                      latestTransaction.status
                    }
                  />

                  <DetailRow
                    label="Transaction Amount"
                    value={formatAmount(
                      latestTransaction.amount
                    )}
                  />

                  <DetailRow
                    label="Created"
                    value={formatDate(
                      latestTransaction.createdAt
                    )}
                  />
                </div>
              </section>
            )}
          </div>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Deposit Amount
              </p>

              <p className="mt-2 text-4xl font-bold text-white">
                {formatAmount(
                  deposit.amount
                )}
              </p>

              <p className="mt-2 text-sm text-gray-500">
                {methodLabel(deposit.method)}
              </p>

              {isPending ? (
                <>
                  <div className="mt-6 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
                    <p className="text-sm font-semibold text-yellow-400">
                      Pending Admin Review
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Verify the user's payment information
                      and uploaded proof before approving this
                      deposit.
                    </p>
                  </div>

                  <div className="mt-5 space-y-3">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() =>
                        reviewDeposit(
                          "APPROVE"
                        )
                      }
                      className="w-full rounded-xl bg-green-500 px-4 py-3 text-sm font-semibold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting
                        ? "Processing..."
                        : "Approve Deposit"}
                    </button>

                    {!showDeclineBox && (
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => {
                          setShowDeclineBox(
                            true
                          );
                          setError("");
                        }}
                        className="w-full rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Decline Deposit
                      </button>
                    )}
                  </div>

                  {showDeclineBox && (
                    <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                      <label
                        htmlFor="decline-reason"
                        className="text-sm font-semibold text-gray-300"
                      >
                        Reason for declining
                      </label>

                      <textarea
                        id="decline-reason"
                        value={declineReason}
                        onChange={(event) =>
                          setDeclineReason(
                            event.target.value
                          )
                        }
                        rows={5}
                        maxLength={1000}
                        placeholder="Explain why this deposit is being declined..."
                        className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-red-500/40"
                      />

                      <p className="mt-1 text-right text-xs text-gray-600">
                        {declineReason.length}/1000
                      </p>

                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={() => {
                            setShowDeclineBox(
                              false
                            );
                            setDeclineReason(
                              ""
                            );
                            setError("");
                          }}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-semibold text-gray-300 transition hover:bg-white/10"
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          disabled={
                            submitting ||
                            !declineReason.trim()
                          }
                          onClick={() =>
                            reviewDeposit(
                              "DECLINE"
                            )
                          }
                          className="rounded-xl bg-red-500 px-3 py-3 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {submitting
                            ? "Processing..."
                            : "Confirm Decline"}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div
                  className={`mt-6 rounded-xl border p-4 ${statusClass(
                    deposit.status
                  )}`}
                >
                  <p className="text-sm font-semibold">
                    This deposit has already been
                    reviewed.
                  </p>

                  <p className="mt-1 text-xs opacity-80">
                    Current status:{" "}
                    {deposit.status}
                  </p>

                  {deposit.reviewedAt && (
                    <p className="mt-2 text-xs opacity-70">
                      Reviewed:{" "}
                      {formatDate(
                        deposit.reviewedAt
                      )}
                    </p>
                  )}
                </div>
              )}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}