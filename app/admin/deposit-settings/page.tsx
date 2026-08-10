"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type BankAccount = {
id: string;
accountName: string;
bankName: string;
accountNumber: string;
routingNumber: string | null;
swiftBic: string | null;
bankAddress: string | null;
instructions: string | null;
isEnabled: boolean;
};

type CardConfig = {
id: string;
paymentLink: string;
instructions: string | null;
isEnabled: boolean;
};

type CryptoOption = {
id: string;
asset: string;
symbol: string;
network: string;
walletAddress: string;
instructions: string | null;
isEnabled: boolean;
};

type PaymentConfig = {
id: string;
method: "CASH_APP" | "PAYPAL" | "ZELLE" | "VENMO";
paymentInformation: string;
instructions: string | null;
isEnabled: boolean;
};

type DepositData = {
bankAccounts: BankAccount[];
cardConfigs: CardConfig[];
cryptoOptions: CryptoOption[];
paymentConfigs: PaymentConfig[];
};

const paymentMethods = [
{
value: "CASH_APP",
label: "Cash App",
},
{
value: "PAYPAL",
label: "PayPal",
},
{
value: "ZELLE",
label: "Zelle",
},
{
value: "VENMO",
label: "Venmo",
},
] as const;

function formatPaymentMethod(method: string) {
return (
paymentMethods.find(
(item) => item.value === method
)?.label ??
method.replaceAll("_", " ")
);
}

export default function AdminDepositSettingsPage() {
const [data, setData] = useState<DepositData | null>(null);
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [message, setMessage] = useState("");
const [error, setError] = useState("");

const [bank, setBank] = useState({
id: "",
accountName: "",
bankName: "",
accountNumber: "",
routingNumber: "",
swiftBic: "",
bankAddress: "",
instructions: "",
isEnabled: true,
});

const [card, setCard] = useState({
id: "",
paymentLink: "",
instructions: "",
isEnabled: true,
});

const [crypto, setCrypto] = useState({
id: "",
asset: "",
symbol: "",
network: "",
walletAddress: "",
instructions: "",
isEnabled: true,
});

const [payments, setPayments] = useState<
Record<
string,
{
id: string;
paymentInformation: string;
instructions: string;
isEnabled: boolean;
}
>

> ({});

async function loadSettings() {
try {
setLoading(true);
setError("");


  const response = await fetch("/api/admin/deposits", {
    method: "GET",
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ||
        "Unable to load deposit settings."
    );
  }

  const depositData: DepositData = result.data;

  setData(depositData);

  const firstBank = depositData.bankAccounts[0];

  if (firstBank) {
    setBank({
      id: firstBank.id,
      accountName: firstBank.accountName,
      bankName: firstBank.bankName,
      accountNumber: firstBank.accountNumber,
      routingNumber: firstBank.routingNumber ?? "",
      swiftBic: firstBank.swiftBic ?? "",
      bankAddress: firstBank.bankAddress ?? "",
      instructions: firstBank.instructions ?? "",
      isEnabled: firstBank.isEnabled,
    });
  }

  const firstCard = depositData.cardConfigs[0];

  if (firstCard) {
    setCard({
      id: firstCard.id,
      paymentLink: firstCard.paymentLink,
      instructions: firstCard.instructions ?? "",
      isEnabled: firstCard.isEnabled,
    });
  }

  const firstCrypto = depositData.cryptoOptions[0];

  if (firstCrypto) {
    setCrypto({
      id: firstCrypto.id,
      asset: firstCrypto.asset,
      symbol: firstCrypto.symbol,
      network: firstCrypto.network,
      walletAddress: firstCrypto.walletAddress,
      instructions: firstCrypto.instructions ?? "",
      isEnabled: firstCrypto.isEnabled,
    });
  }

  const paymentState: Record<
    string,
    {
      id: string;
      paymentInformation: string;
      instructions: string;
      isEnabled: boolean;
    }
  > = {};

  for (const payment of depositData.paymentConfigs) {
    paymentState[payment.method] = {
      id: payment.id,
      paymentInformation:
        payment.paymentInformation,
      instructions:
        payment.instructions ?? "",
      isEnabled: payment.isEnabled,
    };
  }

  setPayments(paymentState);
} catch (err) {
  setError(
    err instanceof Error
      ? err.message
      : "Unable to load deposit settings."
  );
} finally {
  setLoading(false);
}


}

useEffect(() => {
loadSettings();
}, []);

async function saveConfiguration(
payload: Record<string, unknown>
) {
try {
setSaving(true);
setMessage("");
setError("");


  const response = await fetch("/api/admin/deposits", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Unable to save settings."
    );
  }

  setMessage(
    result.message || "Settings saved successfully."
  );

  await loadSettings();
} catch (err) {
  setError(
    err instanceof Error
      ? err.message
      : "Unable to save settings."
  );
} finally {
  setSaving(false);
}


}

async function deleteConfiguration(
action: string,
id: string
) {
const confirmed = window.confirm(
"Are you sure you want to delete this configuration?"
);


if (!confirmed) {
  return;
}

await saveConfiguration({
  action,
  id,
});


}

function updatePayment(
method: string,
field:
| "paymentInformation"
| "instructions"
| "isEnabled",
value: string | boolean
) {
setPayments((current) => ({
...current,
[method]: {
id: current[method]?.id ?? "",
paymentInformation:
current[method]?.paymentInformation ?? "",
instructions:
current[method]?.instructions ?? "",
isEnabled:
current[method]?.isEnabled ?? true,
[field]: value,
},
}));
}

if (loading) {
return ( <main className="min-h-screen bg-[#050706] text-white"> <div className="flex min-h-screen items-center justify-center"> <div className="text-center"> <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-emerald-400/20 border-t-emerald-400" />


        <p className="mt-4 text-sm text-zinc-500">
          Loading deposit settings...
        </p>
      </div>
    </div>
  </main>
);


}

return ( <main className="min-h-screen bg-[#050706] text-white"> <div className="flex min-h-screen">
{/* ADMIN SIDEBAR */} <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-[#080a09] lg:flex lg:flex-col"> <div className="border-b border-white/10 p-6"> <Link
           href="/admin"
           className="flex items-center gap-3"
         > <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 font-bold text-black">
E </div>


          <div>
            <p className="font-semibold">
              Edge Portfolio
            </p>

            <p className="text-xs text-zinc-600">
              Administration
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        <Link
          href="/admin"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
        >
          <span>⌂</span>
          Admin dashboard
        </Link>

        <Link
          href="/admin/users"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
        >
          <span>◉</span>
          Users
        </Link>

        <Link
          href="/admin/kyc"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
        >
          <span>✓</span>
          KYC
        </Link>

        {/* ACTIVE: DEPOSIT SETTINGS */}
        <Link
          href="/admin/deposit-settings"
          className="flex items-center gap-3 rounded-xl bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-400"
        >
          <span>↓</span>
          Deposit settings
        </Link>

        {/* NEW: WITHDRAWAL SETTINGS */}
        <Link
          href="/admin/withdrawal-settings"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
        >
          <span>↑</span>
          Withdrawal settings
        </Link>

        {/* TRANSACTIONS */}
        <Link
          href="/admin/transactions"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
        >
          <span>↔</span>
          Transactions
        </Link>
      </nav>
    </aside>

    {/* MAIN CONTENT */}
    <section className="min-w-0 flex-1">
      <header className="border-b border-white/10 bg-[#080a09] px-5 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-emerald-400">
              Administration
            </p>

            <h1 className="mt-1 text-xl font-semibold">
              Deposit settings
            </h1>
          </div>

          <Link
            href="/admin"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-400 transition hover:border-white/20 hover:text-white"
          >
            Admin dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-semibold tracking-tight">
            Manage deposit channels
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
            Configure the payment information your
            users will see when they open the deposit
            page. A method can be disabled without
            deleting its configuration.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-sm text-emerald-300">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* BANK TRANSFER */}
        <section className="mb-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row">
            <div>
              <p className="text-xs uppercase tracking-wider text-emerald-400">
                Deposit method 01
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                Bank transfer
              </h2>

              <p className="mt-1 text-sm text-zinc-600">
                Bank details shown to users making
                a bank deposit.
              </p>
            </div>

            <label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-400">
              <input
                type="checkbox"
                checked={bank.isEnabled}
                onChange={(event) =>
                  setBank((current) => ({
                    ...current,
                    isEnabled:
                      event.target.checked,
                  }))
                }
                className="h-4 w-4 accent-emerald-400"
              />
              Enabled
            </label>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Account name
              </label>

              <input
                value={bank.accountName}
                onChange={(event) =>
                  setBank((current) => ({
                    ...current,
                    accountName:
                      event.target.value,
                  }))
                }
                placeholder="Account holder name"
                className="admin-input"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Bank name
              </label>

              <input
                value={bank.bankName}
                onChange={(event) =>
                  setBank((current) => ({
                    ...current,
                    bankName:
                      event.target.value,
                  }))
                }
                placeholder="Bank name"
                className="admin-input"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Account number
              </label>

              <input
                value={bank.accountNumber}
                onChange={(event) =>
                  setBank((current) => ({
                    ...current,
                    accountNumber:
                      event.target.value,
                  }))
                }
                placeholder="Account number"
                className="admin-input"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Routing number
              </label>

              <input
                value={bank.routingNumber}
                onChange={(event) =>
                  setBank((current) => ({
                    ...current,
                    routingNumber:
                      event.target.value,
                  }))
                }
                placeholder="Optional"
                className="admin-input"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                SWIFT / BIC
              </label>

              <input
                value={bank.swiftBic}
                onChange={(event) =>
                  setBank((current) => ({
                    ...current,
                    swiftBic:
                      event.target.value,
                  }))
                }
                placeholder="Optional"
                className="admin-input"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Bank address
              </label>

              <input
                value={bank.bankAddress}
                onChange={(event) =>
                  setBank((current) => ({
                    ...current,
                    bankAddress:
                      event.target.value,
                  }))
                }
                placeholder="Optional"
                className="admin-input"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm text-zinc-400">
                Instructions
              </label>

              <textarea
                value={bank.instructions}
                onChange={(event) =>
                  setBank((current) => ({
                    ...current,
                    instructions:
                      event.target.value,
                  }))
                }
                rows={4}
                placeholder="Tell users exactly how to complete the bank transfer."
                className="admin-input resize-none"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() =>
                saveConfiguration({
                  action: "SAVE_BANK",
                  ...bank,
                })
              }
              className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save bank settings"}
            </button>

            {bank.id && (
              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  deleteConfiguration(
                    "DELETE_BANK",
                    bank.id
                  )
                }
                className="rounded-xl border border-red-400/20 px-5 py-3 text-sm text-red-300 transition hover:bg-red-400/10 disabled:opacity-50"
              >
                Delete
              </button>
            )}
          </div>
        </section>

        {/* CARD */}
        <section className="mb-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row">
            <div>
              <p className="text-xs uppercase tracking-wider text-emerald-400">
                Deposit method 02
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                Card
              </h2>

              <p className="mt-1 text-sm text-zinc-600">
                Provide a secure card payment link or
                payment information.
              </p>
            </div>

            <label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-400">
              <input
                type="checkbox"
                checked={card.isEnabled}
                onChange={(event) =>
                  setCard((current) => ({
                    ...current,
                    isEnabled:
                      event.target.checked,
                  }))
                }
                className="h-4 w-4 accent-emerald-400"
              />
              Enabled
            </label>
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Card payment link / information
              </label>

              <input
                value={card.paymentLink}
                onChange={(event) =>
                  setCard((current) => ({
                    ...current,
                    paymentLink:
                      event.target.value,
                  }))
                }
                placeholder="https://..."
                className="admin-input"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Instructions
              </label>

              <textarea
                value={card.instructions}
                onChange={(event) =>
                  setCard((current) => ({
                    ...current,
                    instructions:
                      event.target.value,
                  }))
                }
                rows={4}
                placeholder="Card payment instructions."
                className="admin-input resize-none"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() =>
                saveConfiguration({
                  action: "SAVE_CARD",
                  ...card,
                })
              }
              className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save card settings"}
            </button>

            {card.id && (
              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  deleteConfiguration(
                    "DELETE_CARD",
                    card.id
                  )
                }
                className="rounded-xl border border-red-400/20 px-5 py-3 text-sm text-red-300 transition hover:bg-red-400/10 disabled:opacity-50"
              >
                Delete
              </button>
            )}
          </div>
        </section>

        {/* CRYPTO */}
        <section className="mb-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div>
            <p className="text-xs uppercase tracking-wider text-emerald-400">
              Deposit method 03
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              Cryptocurrency
            </h2>

            <p className="mt-1 text-sm text-zinc-600">
              Configure the wallet address users
              should send cryptocurrency to.
            </p>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Asset
              </label>

              <input
                value={crypto.asset}
                onChange={(event) =>
                  setCrypto((current) => ({
                    ...current,
                    asset:
                      event.target.value,
                  }))
                }
                placeholder="Bitcoin"
                className="admin-input"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Symbol
              </label>

              <input
                value={crypto.symbol}
                onChange={(event) =>
                  setCrypto((current) => ({
                    ...current,
                    symbol:
                      event.target.value,
                  }))
                }
                placeholder="BTC"
                className="admin-input"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Network
              </label>

              <input
                value={crypto.network}
                onChange={(event) =>
                  setCrypto((current) => ({
                    ...current,
                    network:
                      event.target.value,
                  }))
                }
                placeholder="Bitcoin"
                className="admin-input"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="mb-2 block text-sm text-zinc-400">
                Wallet address
              </label>

              <input
                value={crypto.walletAddress}
                onChange={(event) =>
                  setCrypto((current) => ({
                    ...current,
                    walletAddress:
                      event.target.value,
                  }))
                }
                placeholder="Wallet address"
                className="admin-input font-mono"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="mb-2 block text-sm text-zinc-400">
                Instructions
              </label>

              <textarea
                value={crypto.instructions}
                onChange={(event) =>
                  setCrypto((current) => ({
                    ...current,
                    instructions:
                      event.target.value,
                  }))
                }
                rows={4}
                placeholder="Crypto deposit instructions."
                className="admin-input resize-none"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-400">
              <input
                type="checkbox"
                checked={crypto.isEnabled}
                onChange={(event) =>
                  setCrypto((current) => ({
                    ...current,
                    isEnabled:
                      event.target.checked,
                  }))
                }
                className="h-4 w-4 accent-emerald-400"
              />
              Enabled
            </label>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() =>
                saveConfiguration({
                  action: "SAVE_CRYPTO",
                  ...crypto,
                })
              }
              className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save cryptocurrency settings"}
            </button>

            {crypto.id && (
              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  deleteConfiguration(
                    "DELETE_CRYPTO",
                    crypto.id
                  )
                }
                className="rounded-xl border border-red-400/20 px-5 py-3 text-sm text-red-300 transition hover:bg-red-400/10 disabled:opacity-50"
              >
                Delete
              </button>
            )}
          </div>
        </section>

        {/* PAYMENT METHODS */}
        <section className="mb-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div>
            <p className="text-xs uppercase tracking-wider text-emerald-400">
              Deposit methods 04–07
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              Payment apps
            </h2>

            <p className="mt-1 text-sm text-zinc-600">
              Configure Cash App, PayPal, Zelle,
              and Venmo individually.
            </p>
          </div>

          <div className="mt-6 space-y-5">
            {paymentMethods.map((paymentMethod) => {
              const current =
                payments[paymentMethod.value] ?? {
                  id: "",
                  paymentInformation: "",
                  instructions: "",
                  isEnabled: true,
                };

              return (
                <div
                  key={paymentMethod.value}
                  className="rounded-2xl border border-white/10 bg-black/20 p-5"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row">
                    <div>
                      <h3 className="font-medium">
                        {paymentMethod.label}
                      </h3>

                      <p className="mt-1 text-xs text-zinc-600">
                        This information will be
                        displayed to users when they
                        choose{" "}
                        {paymentMethod.label}.
                      </p>
                    </div>

                    <label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-400">
                      <input
                        type="checkbox"
                        checked={current.isEnabled}
                        onChange={(event) =>
                          updatePayment(
                            paymentMethod.value,
                            "isEnabled",
                            event.target.checked
                          )
                        }
                        className="h-4 w-4 accent-emerald-400"
                      />
                      Enabled
                    </label>
                  </div>

                  <div className="mt-5 space-y-5">
                    <div>
                      <label className="mb-2 block text-sm text-zinc-400">
                        Payment information
                      </label>

                      <input
                        value={
                          current.paymentInformation
                        }
                        onChange={(event) =>
                          updatePayment(
                            paymentMethod.value,
                            "paymentInformation",
                            event.target.value
                          )
                        }
                        placeholder={`Enter ${paymentMethod.label} payment information`}
                        className="admin-input"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-zinc-400">
                        Instructions
                      </label>

                      <textarea
                        value={current.instructions}
                        onChange={(event) =>
                          updatePayment(
                            paymentMethod.value,
                            "instructions",
                            event.target.value
                          )
                        }
                        rows={3}
                        placeholder="Optional instructions"
                        className="admin-input resize-none"
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() =>
                        saveConfiguration({
                          action: "SAVE_PAYMENT",
                          id: current.id,
                          method:
                            paymentMethod.value,
                          paymentInformation:
                            current.paymentInformation,
                          instructions:
                            current.instructions,
                          isEnabled:
                            current.isEnabled,
                        })
                      }
                      className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-50"
                    >
                      {saving
                        ? "Saving..."
                        : `Save ${formatPaymentMethod(
                            paymentMethod.value
                          )}`}
                    </button>

                    {current.id && (
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() =>
                          deleteConfiguration(
                            "DELETE_PAYMENT",
                            current.id
                          )
                        }
                        className="rounded-xl border border-red-400/20 px-5 py-3 text-sm text-red-300 transition hover:bg-red-400/10 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* STATUS */}
        <section className="rounded-3xl border border-emerald-400/10 bg-emerald-400/5 p-6">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400">
              ✓
            </div>

            <div>
              <h3 className="font-medium text-emerald-300">
                Deposit configuration
              </h3>

              <p className="mt-1 text-sm leading-6 text-zinc-500">
                Enabled methods are automatically
                available on the user deposit page.
                Disabled methods will not be available
                for new deposit requests.
              </p>

              <Link
                href="/deposit"
                className="mt-4 inline-block text-sm font-medium text-emerald-400 hover:text-emerald-300"
              >
                Open user deposit page →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </section>
  </div>

  <style jsx global>{`
    .admin-input {
      width: 100%;
      border-radius: 0.75rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(0, 0, 0, 0.3);
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      color: white;
      outline: none;
      transition: border-color 150ms ease;
    }

    .admin-input::placeholder {
      color: rgb(63 63 70);
    }

    .admin-input:focus {
      border-color: rgba(52, 211, 153, 0.5);
    }
  `}</style>
</main>


);
}
