import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

const METHOD_ALIASES: Record<string, string> = {
  CRYPTO: "CRYPTOCURRENCY",
  CRYPTOCURRENCY: "CRYPTOCURRENCY",
  BANK: "BANK_TRANSFER",
  BANK_TRANSFER: "BANK_TRANSFER",
  CARD: "CARD",
  CASH_APP: "CASH_APP",
  PAYPAL: "PAYPAL",
  ZELLE: "ZELLE",
  VENMO: "VENMO",
};

const SUPPORTED_METHODS = [
  "BANK_TRANSFER",
  "CARD",
  "CRYPTOCURRENCY",
  "CASH_APP",
  "PAYPAL",
  "ZELLE",
  "VENMO",
] as const;

type SupportedMethod = (typeof SUPPORTED_METHODS)[number];

function isSupportedMethod(
  method: string
): method is SupportedMethod {
  return SUPPORTED_METHODS.includes(
    method as SupportedMethod
  );
}

function normalizeMethod(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  const normalized = value.trim().toUpperCase();

  return METHOD_ALIASES[normalized] ?? normalized;
}

function parseAmount(value: unknown): number | null {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      return null;
    }

    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const amount = Number(value.trim());

  if (!Number.isFinite(amount)) {
    return null;
  }

  return amount;
}

/**
 * GET /api/deposit
 *
 * Returns all enabled deposit methods configured by admin.
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be logged in.",
        },
        { status: 401 }
      );
    }

    if (user.role === "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Administrators cannot create deposit requests.",
        },
        { status: 403 }
      );
    }

    if (user.kyc?.status !== "APPROVED") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your KYC verification must be approved first.",
        },
        { status: 403 }
      );
    }

    const [
      bankAccounts,
      cardConfigs,
      cryptoOptions,
      paymentConfigs,
    ] = await Promise.all([
      prisma.bankDepositAccount.findMany({
        where: {
          isEnabled: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      }),

      prisma.cardDepositConfig.findMany({
        where: {
          isEnabled: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      }),

      prisma.cryptoDepositOption.findMany({
        where: {
          isEnabled: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      }),

      prisma.paymentDepositConfig.findMany({
        where: {
          isEnabled: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      }),
    ]);

    /**
     * Convert card configurations into the same shape
     * used by the deposit page.
     */
    const formattedCardConfigs = cardConfigs.map(
      (card) => ({
        id: card.id,
        method: "CARD" as const,
        paymentInformation: card.paymentLink,
        instructions: card.instructions,
      })
    );

    /**
     * Combine card + Cash App + PayPal + Zelle + Venmo
     * into one payment configuration array.
     */
    const formattedPaymentConfigs = [
      ...formattedCardConfigs,
      ...paymentConfigs.map((payment) => ({
        id: payment.id,
        method: payment.method,
        paymentInformation:
          payment.paymentInformation,
        instructions: payment.instructions,
      })),
    ];

    /**
     * IMPORTANT:
     *
     * The deposit page expects `data.config`.
     *
     * Your previous route returned `data.methods`,
     * which is why the page couldn't find the configuration.
     */
    return NextResponse.json({
      success: true,

      config: {
        bankAccount: bankAccounts[0] ?? null,

        cryptoOptions,

        paymentConfigs: formattedPaymentConfigs,
      },

      /**
       * Keep the methods object as well so other
       * parts of the application can use it later.
       */
      methods: {
        bankTransfer: bankAccounts,
        card: cardConfigs,
        cryptocurrency: cryptoOptions,
        payment: paymentConfigs,
      },
    });
  } catch (error) {
    console.error(
      "Deposit configuration error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load deposit methods.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/deposit
 *
 * Creates a pending deposit request.
 *
 * IMPORTANT:
 * This does NOT add money to the user's balance.
 *
 * The balance should only change after an administrator
 * approves the deposit request.
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be logged in.",
        },
        { status: 401 }
      );
    }

    if (user.role === "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Administrators cannot create deposit requests.",
        },
        { status: 403 }
      );
    }

    if (user.kyc?.status !== "APPROVED") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your KYC verification must be approved first.",
        },
        { status: 403 }
      );
    }

    if (
      user.status === "BLOCKED" ||
      user.status === "SUSPENDED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your account cannot create deposit requests.",
        },
        { status: 403 }
      );
    }

    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        { status: 400 }
      );
    }

    const method = normalizeMethod(body.method);

    if (!isSupportedMethod(method)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please select a valid deposit method.",
        },
        { status: 400 }
      );
    }

    const amount = parseAmount(body.amount);

    if (
      amount === null ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid deposit amount.",
        },
        { status: 400 }
      );
    }

    if (amount > 1000000000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The deposit amount is too large.",
        },
        { status: 400 }
      );
    }

    const reference =
      typeof body.reference === "string"
        ? body.reference.trim().slice(0, 200)
        : null;

    const notes =
      typeof body.note === "string"
        ? body.note.trim().slice(0, 2000)
        : typeof body.notes === "string"
        ? body.notes.trim().slice(0, 2000)
        : null;

    let bankAccountId: string | null = null;
    let cryptoOptionId: string | null = null;
    let paymentConfigId: string | null = null;

    let selectedBankName: string | null = null;
    let selectedAccountName: string | null = null;
    let selectedAccountNumber: string | null = null;
    let selectedRoutingNumber: string | null = null;
    let selectedSwiftBic: string | null = null;
    let selectedBankAddress: string | null = null;

    let cryptoAsset: string | null = null;
    let cryptoSymbol: string | null = null;
    let cryptoNetwork: string | null = null;
    let cryptoWalletAddress: string | null = null;

    let paymentInformation: string | null = null;

    /**
     * BANK TRANSFER
     */
    if (method === "BANK_TRANSFER") {
      const bankAccount =
        await prisma.bankDepositAccount.findFirst({
          where: {
            isEnabled: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        });

      if (!bankAccount) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Bank transfer deposits are currently unavailable.",
          },
          { status: 400 }
        );
      }

      bankAccountId = bankAccount.id;

      selectedBankName =
        bankAccount.bankName;

      selectedAccountName =
        bankAccount.accountName;

      selectedAccountNumber =
        bankAccount.accountNumber;

      selectedRoutingNumber =
        bankAccount.routingNumber ?? null;

      selectedSwiftBic =
        bankAccount.swiftBic ?? null;

      selectedBankAddress =
        bankAccount.bankAddress ?? null;
    }

    /**
     * CARD
     *
     * CardDepositConfig is a separate Prisma model,
     * so we do NOT put its ID into paymentConfigId.
     *
     * Instead we save the payment information directly
     * on DepositRequest.paymentInformation.
     */
    if (method === "CARD") {
      const cardConfig =
        await prisma.cardDepositConfig.findFirst({
          where: {
            isEnabled: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        });

      if (!cardConfig) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Card deposits are currently unavailable.",
          },
          { status: 400 }
        );
      }

      paymentInformation =
        cardConfig.paymentLink;
    }

    /**
     * CRYPTOCURRENCY
     */
    if (method === "CRYPTOCURRENCY") {
      const cryptoOption =
        await prisma.cryptoDepositOption.findFirst({
          where: {
            isEnabled: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        });

      if (!cryptoOption) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Cryptocurrency deposits are currently unavailable.",
          },
          { status: 400 }
        );
      }

      cryptoOptionId =
        cryptoOption.id;

      cryptoAsset =
        cryptoOption.asset;

      cryptoSymbol =
        cryptoOption.symbol;

      cryptoNetwork =
        cryptoOption.network;

      cryptoWalletAddress =
        cryptoOption.walletAddress;
    }

    /**
     * CASH APP / PAYPAL / ZELLE / VENMO
     */
    if (
      method === "CASH_APP" ||
      method === "PAYPAL" ||
      method === "ZELLE" ||
      method === "VENMO"
    ) {
      const paymentConfig =
        await prisma.paymentDepositConfig.findUnique({
          where: {
            method,
          },
        });

      if (
        !paymentConfig ||
        !paymentConfig.isEnabled
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "This payment method is currently unavailable.",
          },
          { status: 400 }
        );
      }

      paymentConfigId =
        paymentConfig.id;

      paymentInformation =
        paymentConfig.paymentInformation;
    }

    const deposit =
      await prisma.$transaction(
        async (tx) => {
          const createdDeposit =
            await tx.depositRequest.create({
              data: {
                userId: user.id,

                method,

                status: "PENDING",

                amount,

                reference:
                  reference || null,

                notes:
                  notes || null,

                bankAccountId,

                cryptoOptionId,

                paymentConfigId,

                selectedBankName,

                selectedAccountName,

                selectedAccountNumber,

                selectedRoutingNumber,

                selectedSwiftBic,

                selectedBankAddress,

                cryptoAsset,

                cryptoSymbol,

                cryptoNetwork,

                cryptoWalletAddress,

                paymentInformation,
              },
            });

          await tx.accountActivity.create({
            data: {
              userId: user.id,

              type: "DEPOSIT_SUBMITTED",

              description: `Deposit request submitted for $${amount.toFixed(
                2
              )} using ${method
                .replaceAll("_", " ")
                .toLowerCase()
                .replace(/\b\w/g, (letter) =>
                  letter.toUpperCase()
                )}.`,
            },
          });

          return createdDeposit;
        }
      );

    return NextResponse.json(
      {
        success: true,

        message:
          "Your deposit request has been submitted successfully.",

        deposit: {
          id: deposit.id,

          method: deposit.method,

          status: deposit.status,

          amount:
            deposit.amount.toString(),

          createdAt:
            deposit.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Deposit request error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to submit your deposit request.",
      },
      { status: 500 }
    );
  }
}