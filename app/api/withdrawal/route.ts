
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

const METHOD_ALIASES: Record<string, string> = {
  BANK: "BANK_TRANSFER",
  BANK_TRANSFER: "BANK_TRANSFER",
  CASHAPP: "CASH_APP",
  CASH_APP: "CASH_APP",
  PAYPAL: "PAYPAL",
  ZELLE: "ZELLE",
  VENMO: "VENMO",
};

const SUPPORTED_METHODS = [
  "BANK_TRANSFER",
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
 * GET /api/withdrawal
 *
 * Returns the current user's withdrawal requests.
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

    const withdrawals =
      await prisma.withdrawalRequest.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          method: true,
          status: true,
          amount: true,
          name: true,
          email: true,
          phone: true,
          tag: true,
          bankAccountName: true,
          bankAccountNumber: true,
          routingNumber: true,
          swiftBic: true,
          bankName: true,
          bankAddress: true,
          reviewedAt: true,
          reviewAction: true,
          declineReason: true,
          createdAt: true,
          updatedAt: true,
        },
      });

    return NextResponse.json({
      success: true,
      withdrawals: withdrawals.map(
        (withdrawal) => ({
          ...withdrawal,
          amount:
            withdrawal.amount.toString(),
        })
      ),
    });
  } catch (error) {
    console.error(
      "Withdrawal GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load withdrawal requests.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/withdrawal
 *
 * Creates a pending withdrawal request.
 *
 * IMPORTANT:
 * This route does NOT immediately send money
 * and does NOT permanently deduct the balance.
 *
 * The administrator must approve the request first.
 */
export async function POST(
  request: Request
) {
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
            "Administrators cannot create withdrawal requests.",
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
            "Your account cannot create withdrawal requests.",
        },
        { status: 403 }
      );
    }

    if (user.kyc?.status !== "APPROVED") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your KYC verification must be approved before you can withdraw.",
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

    const method = normalizeMethod(
      body.method
    );

    if (!isSupportedMethod(method)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please select a valid withdrawal method.",
        },
        { status: 400 }
      );
    }

    const amount = parseAmount(
      body.amount
    );

    if (
      amount === null ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a valid withdrawal amount.",
        },
        { status: 400 }
      );
    }

    if (amount > 1000000000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The withdrawal amount is too large.",
        },
        { status: 400 }
      );
    }

    const name =
      typeof body.name === "string"
        ? body.name.trim().slice(0, 200)
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().slice(0, 200)
        : "";

    const phone =
      typeof body.phone === "string"
        ? body.phone.trim().slice(0, 50)
        : "";

    const tag =
      typeof body.tag === "string"
        ? body.tag.trim().slice(0, 200)
        : "";

    const bankAccountName =
      typeof body.bankAccountName ===
      "string"
        ? body.bankAccountName
            .trim()
            .slice(0, 200)
        : "";

    const bankAccountNumber =
      typeof body.bankAccountNumber ===
      "string"
        ? body.bankAccountNumber
            .trim()
            .slice(0, 100)
        : "";

    const routingNumber =
      typeof body.routingNumber === "string"
        ? body.routingNumber
            .trim()
            .slice(0, 100)
        : "";

    const swiftBic =
      typeof body.swiftBic === "string"
        ? body.swiftBic
            .trim()
            .slice(0, 100)
        : "";

    const bankName =
      typeof body.bankName === "string"
        ? body.bankName
            .trim()
            .slice(0, 200)
        : "";

    const bankAddress =
      typeof body.bankAddress ===
      "string"
        ? body.bankAddress
            .trim()
            .slice(0, 500)
        : "";

    /**
     * Common validation.
     */
    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter your full name.",
        },
        { status: 400 }
      );
    }

    /**
     * Method-specific validation.
     */
    if (method === "BANK_TRANSFER") {
      if (
        !bankAccountName ||
        !bankAccountNumber ||
        !bankName
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Please provide your bank account name, account number, and bank name.",
          },
          { status: 400 }
        );
      }
    }

    if (method === "CASH_APP") {
      if (!tag) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Please provide your Cash App username.",
          },
          { status: 400 }
        );
      }
    }

    if (method === "PAYPAL") {
      if (!email) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Please provide your PayPal email address.",
          },
          { status: 400 }
        );
      }
    }

    if (method === "ZELLE") {
      if (!email && !phone) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Please provide your Zelle email or phone number.",
          },
          { status: 400 }
        );
      }
    }

    if (method === "VENMO") {
      if (!tag) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Please provide your Venmo username.",
          },
          { status: 400 }
        );
      }
    }

    /**
     * Get the user's balance.
     *
     * The balance check happens on the server.
     * We never trust the amount supplied by
     * the browser.
     */
    const balance =
      await prisma.balance.findUnique({
        where: {
          userId: user.id,
        },
      });

    if (!balance) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your account balance could not be found.",
        },
        { status: 400 }
      );
    }

    const availableBalance =
      Number(balance.available);

    if (
      !Number.isFinite(availableBalance) ||
      availableBalance < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your account balance is currently unavailable.",
        },
        { status: 400 }
      );
    }

    if (amount > availableBalance) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Insufficient available balance for this withdrawal.",
        },
        { status: 400 }
      );
    }

    /**
     * Prevent multiple large pending
     * withdrawal requests from being
     * submitted at the same time.
     *
     * We calculate existing pending
     * withdrawals before creating this one.
     */
    const pendingWithdrawals =
      await prisma.withdrawalRequest.findMany({
        where: {
          userId: user.id,
          status: "PENDING",
        },
        select: {
          amount: true,
        },
      });

    const pendingTotal =
      pendingWithdrawals.reduce(
        (total, withdrawal) =>
          total + Number(withdrawal.amount),
        0
      );

    if (
      !Number.isFinite(pendingTotal) ||
      pendingTotal + amount >
        availableBalance
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This withdrawal would exceed your available balance after accounting for pending withdrawal requests.",
        },
        { status: 400 }
      );
    }

    /**
     * Create the withdrawal request.
     *
     * IMPORTANT:
     * The account balance is NOT reduced here.
     *
     * The admin approval route will handle
     * the balance change later.
     */
    const withdrawal =
      await prisma.$transaction(
        async (tx) => {
          const createdWithdrawal =
            await tx.withdrawalRequest.create({
              data: {
                userId: user.id,

                method,

                status: "PENDING",

                amount,

                name: name || null,
                email: email || null,
                phone: phone || null,
                tag: tag || null,

                bankAccountName:
                  bankAccountName || null,

                bankAccountNumber:
                  bankAccountNumber || null,

                routingNumber:
                  routingNumber || null,

                swiftBic:
                  swiftBic || null,

                bankName:
                  bankName || null,

                bankAddress:
                  bankAddress || null,
              },
            });

          await tx.accountActivity.create({
            data: {
              userId: user.id,

              type: "WITHDRAWAL_SUBMITTED",

              description:
                `Withdrawal request submitted for $${amount.toFixed(
                  2
                )} using ${method
                  .replaceAll("_", " ")
                  .toLowerCase()
                  .replace(
                    /\b\w/g,
                    (letter) =>
                      letter.toUpperCase()
                  )}.`,
            },
          });

          return createdWithdrawal;
        }
      );

    return NextResponse.json(
      {
        success: true,

        message:
          "Your withdrawal request has been submitted successfully and is awaiting administrator approval.",

        withdrawal: {
          id: withdrawal.id,

          method: withdrawal.method,

          status: withdrawal.status,

          amount:
            withdrawal.amount.toString(),

          createdAt:
            withdrawal.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Withdrawal POST error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to submit your withdrawal request.",
      },
      { status: 500 }
    );
  }
}