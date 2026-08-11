"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type TransactionType =
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "TRADE"
  | "REFUND"
  | "ADJUSTMENT";

type TransactionStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "REVERSED";

type ReviewTransaction = {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: string | number;
  currency: string;
  description: string | null;
  reference: string | null;
  createdAt: string;
  completedAt: string | null;

  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };

  deposit: {
    id: string;
    method: string;
    status: string;
    reference: string | null;
    amount: string | number;
    notes: string | null;
    proofFileId: string | null;
    invoiceFileId: string | null;
    declineReason: string | null;
    reviewedAt: string | null;
    createdAt: string;

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
  } | null;

  withdrawal: {
    id: string;
    method: string;
    status: string;
    amount: string | number;
    name: string | null;
    email: string | null;
    phone: string | null;
    tag: string | null;

    bankAccountName: string | null;
    bankAccountNumber: string | null;
    routingNumber: string | null;
    swiftBic: string | null;
    bankName: string | null;
    bankAddress: string | null;

    declineReason: string | null;
    reviewedAt: string | null;
    createdAt: string;
  } | null;
};

type ApiResponse = {
  success?: boolean;
  transaction?: ReviewTransaction;
  error?: string;
  message?: string;
};

function formatAmount(
  amount: string | number,
  currency: string
): string {
  const numericAmount =
    typeof amount === "number" ? amount : Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return `${currency || "USD"} 0.00`;
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(numericAmount);
  } catch {
    return `${currency || "USD"} ${numericAmount.toLocaleString()}`;
  }
}

function formatDate(date: string | null): string {
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

function getMethodLabel(
  method: string | null | undefined
): string {
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
            word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(" ");
  }
}

function getStatusClass(status: string): string {
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
      return "border-white/10 bg-white/5 text-gray-300";
  }
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
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

export default function AdminTransactionReviewPage() {
  const params = useParams();
  const router = useRouter();

  const transactionId = String(params.id);

  const [transaction, setTransaction] =
    useState<ReviewTransaction | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [declineReason, setDeclineReason] = useState("");
  const [showDeclineBox, setShowDeclineBox] =
    useState(false);

  const loadTransaction = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/admin/transactions/${transactionId}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Unable to load transaction."
        );
      }

      setTransaction(data.transaction || null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load transaction."
      );
    } finally {
      setLoading(false);
    }
  }, [transactionId]);

  useEffect(() => {
    loadTransaction();
  }, [loadTransaction]);

  async function reviewTransaction(
    action: "APPROVE" | "DECLINE"
  ) {
    if (!transaction) {
      return;
    }

    if (
      action === "DECLINE" &&
      !declineReason.trim()
    ) {
      setError(
        "Please provide a reason for declining this transaction."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await fetch(
        `/api/admin/transactions/${transaction.id}`,
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

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Unable to review transaction."
        );
      }

      router.push("/admin/transactions");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to review transaction."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050806] text-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center text-gray-400">
            Loading transaction...
          </div>
        </div>
      </main>
    );
  }

  if (error && !transaction) {
    return (
      <main className="min-h-screen bg-[#050806] text-white">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <Link
            href="/admin/transactions"
            className="text-sm text-green-400 hover:text-green-300"
          >
            ← Back to transactions
          </Link>

          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-400">
            {error}
          </div>
        </div>
      </main>
    );
  }

  if (!transaction) {
    return (
      <main className="min-h-screen bg-[#050806] text-white">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <p className="text-gray-400">
            Transaction not found.
          </p>
        </div>
      </main>
    );
  }

  const isDeposit =
    transaction.type === "DEPOSIT" &&
    Boolean(transaction.deposit);

  const isWithdrawal =
    transaction.type === "WITHDRAWAL" &&
    Boolean(transaction.withdrawal);

  const isPending =
    transaction.status === "PENDING" &&
    ((isDeposit && transaction.deposit?.status === "PENDING") ||
      (isWithdrawal &&
        transaction.withdrawal?.status === "PENDING"));

  const deposit = transaction.deposit;
  const withdrawal = transaction.withdrawal;

  return (
    <main className="min-h-screen bg-[#050806] text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <Link
            href="/admin/transactions"
            className="text-sm text-green-400 transition hover:text-green-300"
          >
            ← Back to transactions
          </Link>

          <div className="mt-5 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-medium text-green-400">
                Transaction Review
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                {isDeposit
                  ? "Deposit Review"
                  : isWithdrawal
                  ? "Withdrawal Review"
                  : "Transaction Details"}
              </h1>

              <p className="mt-2 text-sm text-gray-400">
                Review the transaction information before
                taking administrative action.
              </p>
            </div>

            <span
              className={`inline-flex w-fit rounded-full border px-4 py-2 text-sm font-semibold ${getStatusClass(
                transaction.status
              )}`}
            >
              {transaction.status}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    Transaction Information
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Core transaction details.
                  </p>
                </div>
              </div>

              <div className="grid gap-x-8 md:grid-cols-2">
                <DetailRow
                  label="Transaction ID"
                  value={transaction.id}
                />

                <DetailRow
                  label="Type"
                  value={transaction.type}
                />

                <DetailRow
                  label="Amount"
                  value={formatAmount(
                    transaction.amount,
                    transaction.currency
                  )}
                />

                <DetailRow
                  label="Method"
                  value={getMethodLabel(
                    deposit?.method ||
                      withdrawal?.method
                  )}
                />

                <DetailRow
                  label="Reference"
                  value={
                    transaction.reference ||
                    deposit?.reference
                  }
                />

                <DetailRow
                  label="Created"
                  value={formatDate(
                    transaction.createdAt
                  )}
                />

                <DetailRow
                  label="Description"
                  value={transaction.description}
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
                  value={`${transaction.user.firstName} ${transaction.user.lastName}`}
                />

                <DetailRow
                  label="Email"
                  value={transaction.user.email}
                />

                <DetailRow
                  label="Phone"
                  value={transaction.user.phone}
                />

                <div className="border-b border-white/5 py-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    User Profile
                  </p>

                  <Link
                    href={`/admin/users/${transaction.user.id}`}
                    className="mt-1 inline-block text-sm text-green-400 hover:text-green-300"
                  >
                    View user profile →
                  </Link>
                </div>
              </div>
            </section>

            {isDeposit && deposit && (
              <>
                <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <h2 className="text-lg font-semibold">
                    Deposit Information
                  </h2>

                  <div className="mt-4 grid gap-x-8 md:grid-cols-2">
                    <DetailRow
                      label="Deposit Status"
                      value={deposit.status}
                    />

                    <DetailRow
                      label="Deposit Method"
                      value={getMethodLabel(
                        deposit.method
                      )}
                    />

                    <DetailRow
                      label="Deposit Amount"
                      value={formatAmount(
                        deposit.amount,
                        transaction.currency
                      )}
                    />

                    <DetailRow
                      label="Reference"
                      value={deposit.reference}
                    />

                    <DetailRow
                      label="Notes"
                      value={deposit.notes}
                    />
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
                        value={deposit.selectedBankName}
                      />

                      <DetailRow
                        label="Account Name"
                        value={deposit.selectedAccountName}
                      />

                      <DetailRow
                        label="Account Number"
                        value={
                          deposit.selectedAccountNumber
                        }
                      />

                      <DetailRow
                        label="Routing Number"
                        value={
                          deposit.selectedRoutingNumber
                        }
                      />

                      <DetailRow
                        label="SWIFT / BIC"
                        value={deposit.selectedSwiftBic}
                      />

                      <DetailRow
                        label="Bank Address"
                        value={deposit.selectedBankAddress}
                      />
                    </div>
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
                        value={deposit.cryptoAsset}
                      />

                      <DetailRow
                        label="Symbol"
                        value={deposit.cryptoSymbol}
                      />

                      <DetailRow
                        label="Network"
                        value={deposit.cryptoNetwork}
                      />

                      <DetailRow
                        label="Wallet Address"
                        value={
                          deposit.cryptoWalletAddress
                        }
                      />
                    </div>
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
                            deposit.paymentInformation
                          }
                        />
                      </div>
                    </section>
                  )}

                <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <h2 className="text-lg font-semibold">
                    Submitted Files
                  </h2>

                  <div className="mt-4 space-y-3">
                    {deposit.proofFileId && (
                      <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                        <p className="text-sm font-medium text-white">
                          Deposit Proof
                        </p>

                        <p className="mt-1 break-all text-xs text-gray-500">
                          File ID: {deposit.proofFileId}
                        </p>
                      </div>
                    )}

                    {deposit.invoiceFileId && (
                      <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                        <p className="text-sm font-medium text-white">
                          Payment Invoice
                        </p>

                        <p className="mt-1 break-all text-xs text-gray-500">
                          File ID: {deposit.invoiceFileId}
                        </p>
                      </div>
                    )}

                    {!deposit.proofFileId &&
                      !deposit.invoiceFileId && (
                        <p className="text-sm text-gray-500">
                          No proof or invoice was uploaded.
                        </p>
                      )}
                  </div>
                </section>
              </>
            )}

            {isWithdrawal && withdrawal && (
              <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <h2 className="text-lg font-semibold">
                  Withdrawal Information
                </h2>

                <div className="mt-4 grid gap-x-8 md:grid-cols-2">
                  <DetailRow
                    label="Withdrawal Status"
                    value={withdrawal.status}
                  />

                  <DetailRow
                    label="Withdrawal Method"
                    value={getMethodLabel(
                      withdrawal.method
                    )}
                  />

                  <DetailRow
                    label="Amount"
                    value={formatAmount(
                      withdrawal.amount,
                      transaction.currency
                    )}
                  />

                  <DetailRow
                    label="Name"
                    value={withdrawal.name}
                  />

                  <DetailRow
                    label="Email"
                    value={withdrawal.email}
                  />

                  <DetailRow
                    label="Phone"
                    value={withdrawal.phone}
                  />

                  <DetailRow
                    label="Tag / Username"
                    value={withdrawal.tag}
                  />
                </div>

                {withdrawal.method ===
                  "BANK_TRANSFER" && (
                  <div className="mt-6 border-t border-white/10 pt-5">
                    <h3 className="text-sm font-semibold text-gray-300">
                      Bank Details
                    </h3>

                    <div className="mt-3 grid gap-x-8 md:grid-cols-2">
                      <DetailRow
                        label="Account Name"
                        value={
                          withdrawal.bankAccountName
                        }
                      />

                      <DetailRow
                        label="Account Number"
                        value={
                          withdrawal.bankAccountNumber
                        }
                      />

                      <DetailRow
                        label="Routing Number"
                        value={
                          withdrawal.routingNumber
                        }
                      />

                      <DetailRow
                        label="SWIFT / BIC"
                        value={withdrawal.swiftBic}
                      />

                      <DetailRow
                        label="Bank Name"
                        value={withdrawal.bankName}
                      />

                      <DetailRow
                        label="Bank Address"
                        value={
                          withdrawal.bankAddress
                        }
                      />
                    </div>
                  </div>
                )}
              </section>
            )}
          </div>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Amount
              </p>

              <p className="mt-2 text-3xl font-bold text-white">
                {formatAmount(
                  transaction.amount,
                  transaction.currency
                )}
              </p>

              <p className="mt-2 text-sm text-gray-500">
                {getMethodLabel(
                  deposit?.method ||
                    withdrawal?.method
                )}
              </p>

              {isPending ? (
                <>
                  <div className="mt-6 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
                    <p className="text-sm font-medium text-yellow-400">
                      Awaiting review
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Verify the submitted information before
                      approving this transaction.
                    </p>
                  </div>

                  <div className="mt-5 space-y-3">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() =>
                        reviewTransaction("APPROVE")
                      }
                      className="w-full rounded-xl bg-green-500 px-4 py-3 text-sm font-semibold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting
                        ? "Processing..."
                        : `Approve ${
                            isDeposit
                              ? "Deposit"
                              : "Withdrawal"
                          }`}
                    </button>

                    {!showDeclineBox && (
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() =>
                          setShowDeclineBox(true)
                        }
                        className="w-full rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                      >
                        Decline
                      </button>
                    )}
                  </div>

                  {showDeclineBox && (
                    <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                      <label
                        htmlFor="decline-reason"
                        className="text-sm font-medium text-gray-300"
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
                        rows={4}
                        maxLength={1000}
                        placeholder="Enter the reason for declining this request..."
                        className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-red-500/40"
                      />

                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={() => {
                            setShowDeclineBox(false);
                            setDeclineReason("");
                            setError("");
                          }}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-semibold text-gray-300 hover:bg-white/10"
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
                            reviewTransaction(
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
                  className={`mt-6 rounded-xl border p-4 ${getStatusClass(
                    transaction.status
                  )}`}
                >
                  <p className="text-sm font-semibold">
                    This transaction has already been reviewed.
                  </p>

                  <p className="mt-1 text-xs opacity-80">
                    Current status: {transaction.status}
                  </p>
                </div>
              )}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}