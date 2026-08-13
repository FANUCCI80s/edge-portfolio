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

type RequestStatus =
  | "PENDING"
  | "APPROVED"
  | "DECLINED"
  | "CANCELLED";

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
    status: RequestStatus;
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
    status: RequestStatus;
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

function formatDate(date: string | null | undefined): string {
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
      return "Credit / Debit Card";

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

function getTransactionStatusClass(
  status: string
): string {
  switch (status) {
    case "PENDING":
      return "border-yellow-500/20 bg-yellow-500/10 text-yellow-400";

    case "COMPLETED":
      return "border-green-500/20 bg-green-500/10 text-green-400";

    case "FAILED":
    case "DECLINED":
      return "border-red-500/20 bg-red-500/10 text-red-400";

    case "APPROVED":
      return "border-green-500/20 bg-green-500/10 text-green-400";

    case "CANCELLED":
    case "REVERSED":
      return "border-gray-500/20 bg-gray-500/10 text-gray-400";

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

function ReviewStatus({
  status,
}: {
  status: string;
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getTransactionStatusClass(
        status
      )}`}
    >
      {status}
    </span>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5">
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-400">
          {eyebrow}
        </p>
      )}

      <h2 className="mt-1 text-lg font-semibold text-white">
        {title}
      </h2>

      {description && (
        <p className="mt-1 text-sm text-gray-500">
          {description}
        </p>
      )}
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

      if (!data.transaction) {
        throw new Error("Transaction not found.");
      }

      setTransaction(data.transaction);
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
        "Please provide a reason for declining this request."
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
            Loading transaction review...
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

  const deposit =
    transaction.type === "DEPOSIT"
      ? transaction.deposit
      : null;

  const withdrawal =
    transaction.type === "WITHDRAWAL"
      ? transaction.withdrawal
      : null;

  const isDeposit = Boolean(deposit);

  const isWithdrawal = Boolean(withdrawal);

  const isPending =
    transaction.status === "PENDING" &&
    ((deposit?.status === "PENDING") ||
      (withdrawal?.status === "PENDING"));

  const requestStatus =
    deposit?.status ||
    withdrawal?.status ||
    transaction.status;

  return (
    <main className="min-h-screen bg-[#050806] text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* HEADER */}
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
                Admin Transaction Management
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                {isDeposit
                  ? "Deposit Request Review"
                  : isWithdrawal
                  ? "Withdrawal Request Review"
                  : "Transaction Details"}
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-gray-400">
                {isDeposit
                  ? "Review the user's deposit request, submitted payment information, proof files, and transaction details before approving or declining it."
                  : isWithdrawal
                  ? "Review the user's withdrawal request and payout information before approving or declining it."
                  : "Review the transaction information and account activity."}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${getTransactionStatusClass(
                  transaction.status
                )}`}
              >
                Transaction: {transaction.status}
              </span>

              {(deposit || withdrawal) && (
                <span
                  className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${getTransactionStatusClass(
                    requestStatus
                  )}`}
                >
                  Request: {requestStatus}
                </span>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            {/* ===================================================== */}
            {/* REQUEST REVIEW BANNER */}
            {/* ===================================================== */}

            {isDeposit && deposit && (
              <section className="rounded-2xl border border-green-500/20 bg-green-500/[0.04] p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-400">
                      Deposit Request
                    </p>

                    <h2 className="mt-2 text-xl font-bold text-white">
                      Deposit Request Review
                    </h2>

                    <p className="mt-1 text-sm text-gray-400">
                      Deposit request #{deposit.id}
                    </p>
                  </div>

                  <ReviewStatus status={deposit.status} />
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-wider text-gray-500">
                      Requested Amount
                    </p>

                    <p className="mt-2 text-xl font-bold text-white">
                      {formatAmount(
                        deposit.amount,
                        transaction.currency
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-wider text-gray-500">
                      Method
                    </p>

                    <p className="mt-2 text-sm font-semibold text-white">
                      {getMethodLabel(deposit.method)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-wider text-gray-500">
                      Submitted
                    </p>

                    <p className="mt-2 text-sm font-semibold text-white">
                      {formatDate(deposit.createdAt)}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {isWithdrawal && withdrawal && (
              <section className="rounded-2xl border border-orange-500/20 bg-orange-500/[0.04] p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">
                      Withdrawal Request
                    </p>

                    <h2 className="mt-2 text-xl font-bold text-white">
                      Withdrawal Request Review
                    </h2>

                    <p className="mt-1 text-sm text-gray-400">
                      Withdrawal request #{withdrawal.id}
                    </p>
                  </div>

                  <ReviewStatus status={withdrawal.status} />
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-wider text-gray-500">
                      Requested Amount
                    </p>

                    <p className="mt-2 text-xl font-bold text-white">
                      {formatAmount(
                        withdrawal.amount,
                        transaction.currency
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-wider text-gray-500">
                      Method
                    </p>

                    <p className="mt-2 text-sm font-semibold text-white">
                      {getMethodLabel(
                        withdrawal.method
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-wider text-gray-500">
                      Submitted
                    </p>

                    <p className="mt-2 text-sm font-semibold text-white">
                      {formatDate(
                        withdrawal.createdAt
                      )}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* ===================================================== */}
            {/* TRANSACTION INFORMATION */}
            {/* ===================================================== */}

            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <SectionHeader
                title="Transaction Information"
                description="Core transaction details."
              />

              <div className="grid gap-x-8 md:grid-cols-2">
                <DetailRow
                  label="Transaction ID"
                  value={transaction.id}
                />

                <DetailRow
                  label="Transaction Type"
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
                  label="Currency"
                  value={transaction.currency}
                />

                <DetailRow
                  label="Payment Method"
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
                  label="Transaction Created"
                  value={formatDate(
                    transaction.createdAt
                  )}
                />

                <DetailRow
                  label="Completed At"
                  value={formatDate(
                    transaction.completedAt
                  )}
                />

                <DetailRow
                  label="Description"
                  value={transaction.description}
                />
              </div>
            </section>

            {/* ===================================================== */}
            {/* USER */}
            {/* ===================================================== */}

            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <SectionHeader
                title="User Information"
                description="Account belonging to this transaction."
              />

              <div className="grid gap-x-8 md:grid-cols-2">
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

            {/* ===================================================== */}
            {/* DEPOSIT REQUEST */}
            {/* ===================================================== */}

            {deposit && (
              <>
                <section className="rounded-2xl border border-green-500/20 bg-green-500/[0.025] p-6">
                  <SectionHeader
                    eyebrow="Deposit Request Review"
                    title="Deposit Request Information"
                    description="Everything submitted by the user for this deposit request."
                  />

                  <div className="grid gap-x-8 md:grid-cols-2">
                    <DetailRow
                      label="Deposit Request ID"
                      value={deposit.id}
                    />

                    <DetailRow
                      label="Request Status"
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
                      label="Submitted At"
                      value={formatDate(
                        deposit.createdAt
                      )}
                    />

                    <DetailRow
                      label="Reviewed At"
                      value={formatDate(
                        deposit.reviewedAt
                      )}
                    />

                    <DetailRow
                      label="Notes"
                      value={deposit.notes}
                    />

                    {deposit.declineReason && (
                      <DetailRow
                        label="Decline Reason"
                        value={deposit.declineReason}
                      />
                    )}
                  </div>
                </section>

                {/* BANK DEPOSIT */}
                {deposit.method ===
                  "BANK_TRANSFER" && (
                  <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                    <SectionHeader
                      title="Deposit Bank Transfer Details"
                      description="Bank information associated with the deposit request."
                    />

                    <div className="grid gap-x-8 md:grid-cols-2">
                      <DetailRow
                        label="Bank Name"
                        value={deposit.selectedBankName}
                      />

                      <DetailRow
                        label="Account Name"
                        value={
                          deposit.selectedAccountName
                        }
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
                        value={
                          deposit.selectedSwiftBic
                        }
                      />

                      <DetailRow
                        label="Bank Address"
                        value={
                          deposit.selectedBankAddress
                        }
                      />
                    </div>
                  </section>
                )}

                {/* CRYPTO DEPOSIT */}
                {deposit.method ===
                  "CRYPTOCURRENCY" && (
                  <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                    <SectionHeader
                      title="Cryptocurrency Deposit Details"
                      description="Cryptocurrency information associated with this deposit."
                    />

                    <div className="grid gap-x-8 md:grid-cols-2">
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

                {/* CASH APP / PAYPAL / ZELLE / VENMO / CARD */}
                {deposit.method !==
                  "BANK_TRANSFER" &&
                  deposit.method !==
                    "CRYPTOCURRENCY" && (
                    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                      <SectionHeader
                        title="Payment Information"
                        description={`Information submitted for ${getMethodLabel(
                          deposit.method
                        )}.`}
                      />

                      <div className="rounded-xl border border-white/10 bg-black/20 p-5">
                        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                          Payment Information
                        </p>

                        <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-white">
                          {deposit.paymentInformation ||
                            "No payment information was submitted."}
                        </p>
                      </div>
                    </section>
                  )}

                {/* FILES */}
                <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <SectionHeader
                    title="Deposit Submitted Files"
                    description="Payment proof and invoice information submitted with this request."
                  />

                  <div className="space-y-4">
                    {deposit.proofFileId && (
                      <div className="rounded-xl border border-white/10 bg-black/20 p-5">
                        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                          <div>
                            <p className="font-semibold text-white">
                              Deposit Proof
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              Uploaded proof of payment.
                            </p>
                          </div>

                          <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-400">
                            File uploaded
                          </span>
                        </div>

                        <div className="mt-4 rounded-lg border border-white/5 bg-black/30 p-3">
                          <p className="text-xs text-gray-500">
                            File ID
                          </p>

                          <p className="mt-1 break-all font-mono text-xs text-gray-300">
                            {deposit.proofFileId}
                          </p>
                        </div>
                      </div>
                    )}

                    {deposit.invoiceFileId && (
                      <div className="rounded-xl border border-white/10 bg-black/20 p-5">
                        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                          <div>
                            <p className="font-semibold text-white">
                              Payment Invoice
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              Invoice associated with the payment.
                            </p>
                          </div>

                          <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-400">
                            File uploaded
                          </span>
                        </div>

                        <div className="mt-4 rounded-lg border border-white/5 bg-black/30 p-3">
                          <p className="text-xs text-gray-500">
                            File ID
                          </p>

                          <p className="mt-1 break-all font-mono text-xs text-gray-300">
                            {deposit.invoiceFileId}
                          </p>
                        </div>
                      </div>
                    )}

                    {!deposit.proofFileId &&
                      !deposit.invoiceFileId && (
                        <div className="rounded-xl border border-yellow-500/10 bg-yellow-500/5 p-5">
                          <p className="text-sm font-medium text-yellow-400">
                            No payment files uploaded
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            This request does not contain a proof file or invoice.
                          </p>
                        </div>
                      )}
                  </div>
                </section>
              </>
            )}

            {/* ===================================================== */}
            {/* WITHDRAWAL REQUEST */}
            {/* ===================================================== */}

            {withdrawal && (
              <>
                <section className="rounded-2xl border border-orange-500/20 bg-orange-500/[0.025] p-6">
                  <SectionHeader
                    eyebrow="Withdrawal Request Review"
                    title="Withdrawal Request Information"
                    description="Everything submitted by the user for this withdrawal request."
                  />

                  <div className="grid gap-x-8 md:grid-cols-2">
                    <DetailRow
                      label="Withdrawal Request ID"
                      value={withdrawal.id}
                    />

                    <DetailRow
                      label="Request Status"
                      value={withdrawal.status}
                    />

                    <DetailRow
                      label="Withdrawal Method"
                      value={getMethodLabel(
                        withdrawal.method
                      )}
                    />

                    <DetailRow
                      label="Withdrawal Amount"
                      value={formatAmount(
                        withdrawal.amount,
                        transaction.currency
                      )}
                    />

                    <DetailRow
                      label="Submitted Name"
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

                    <DetailRow
                      label="Submitted At"
                      value={formatDate(
                        withdrawal.createdAt
                      )}
                    />

                    <DetailRow
                      label="Reviewed At"
                      value={formatDate(
                        withdrawal.reviewedAt
                      )}
                    />

                    {withdrawal.declineReason && (
                      <DetailRow
                        label="Decline Reason"
                        value={
                          withdrawal.declineReason
                        }
                      />
                    )}
                  </div>
                </section>

                {/* WITHDRAWAL BANK DETAILS */}
                {withdrawal.method ===
                  "BANK_TRANSFER" && (
                  <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                    <SectionHeader
                      title="Withdrawal Bank Details"
                      description="Bank account information supplied by the user."
                    />

                    <div className="grid gap-x-8 md:grid-cols-2">
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
                        value={
                          withdrawal.swiftBic
                        }
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
                  </section>
                )}

                {/* NON-BANK WITHDRAWAL DETAILS */}
                {withdrawal.method !==
                  "BANK_TRANSFER" && (
                  <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                    <SectionHeader
                      title="Withdrawal Payment Details"
                      description={`Payout information for ${getMethodLabel(
                        withdrawal.method
                      )}.`}
                    />

                    <div className="grid gap-x-8 md:grid-cols-2">
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
                  </section>
                )}
              </>
            )}
          </div>

          {/* ===================================================== */}
          {/* RIGHT REVIEW PANEL */}
          {/* ===================================================== */}

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Administrative Review
              </p>

              <h2 className="mt-2 text-xl font-bold text-white">
                {isDeposit
                  ? "Review Deposit Request"
                  : isWithdrawal
                  ? "Review Withdrawal Request"
                  : "Transaction"}
              </h2>

              <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5">
                <p className="text-xs uppercase tracking-wider text-gray-500">
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
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
                  <span className="text-sm text-gray-500">
                    Transaction
                  </span>

                  <ReviewStatus
                    status={transaction.status}
                  />
                </div>

                {(deposit || withdrawal) && (
                  <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
                    <span className="text-sm text-gray-500">
                      Request
                    </span>

                    <ReviewStatus
                      status={requestStatus}
                    />
                  </div>
                )}
              </div>

              {isPending ? (
                <>
                  <div className="mt-6 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
                    <p className="text-sm font-medium text-yellow-400">
                      Action required
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Review the request information carefully before approving or declining it.
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
                        onClick={() => {
                          setShowDeclineBox(true);
                          setError("");
                        }}
                        className="w-full rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Decline Request
                      </button>
                    )}
                  </div>

                  {showDeclineBox && (
                    <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                      <label
                        htmlFor="decline-reason"
                        className="text-sm font-medium text-gray-300"
                      >
                        Reason for declining
                      </label>

                      <textarea
                        id="decline-reason"
                        value={declineReason}
                        onChange={(event) => {
                          setDeclineReason(
                            event.target.value
                          );
                          setError("");
                        }}
                        rows={5}
                        maxLength={1000}
                        placeholder="Enter the reason for declining this request..."
                        className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-red-500/40"
                      />

                      <div className="mt-2 text-right text-xs text-gray-600">
                        {declineReason.length}/1000
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={() => {
                            setShowDeclineBox(false);
                            setDeclineReason("");
                            setError("");
                          }}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-semibold text-gray-300 transition hover:bg-white/10 disabled:opacity-50"
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
                  className={`mt-6 rounded-xl border p-4 ${getTransactionStatusClass(
                    requestStatus
                  )}`}
                >
                  <p className="text-sm font-semibold">
                    This request has already been reviewed.
                  </p>

                  <p className="mt-1 text-xs opacity-80">
                    Current request status:{" "}
                    {requestStatus}
                  </p>

                  {deposit?.declineReason && (
                    <div className="mt-3 border-t border-white/10 pt-3">
                      <p className="text-xs font-medium uppercase tracking-wider opacity-60">
                        Decline reason
                      </p>

                      <p className="mt-1 text-sm">
                        {deposit.declineReason}
                      </p>
                    </div>
                  )}

                  {withdrawal?.declineReason && (
                    <div className="mt-3 border-t border-white/10 pt-3">
                      <p className="text-xs font-medium uppercase tracking-wider opacity-60">
                        Decline reason
                      </p>

                      <p className="mt-1 text-sm">
                        {withdrawal.declineReason}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 border-t border-white/10 pt-5">
                <Link
                  href={`/admin/users/${transaction.user.id}`}
                  className="block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-gray-300 transition hover:bg-white/10 hover:text-white"
                >
                  View User Account
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}