
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";

const PAYMENT_METHODS = [
  "CASH_APP",
  "PAYPAL",
  "ZELLE",
  "VENMO",
] as const;

type PaymentMethod = (typeof PAYMENT_METHODS)[number];

function isPaymentMethod(value: unknown): value is PaymentMethod {
  return (
    typeof value === "string" &&
    PAYMENT_METHODS.includes(value as PaymentMethod)
  );
}

function cleanString(
  value: unknown,
  maxLength: number
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value.trim();

  if (!cleaned) {
    return null;
  }

  return cleaned.slice(0, maxLength);
}

function cleanRequiredString(
  value: unknown,
  maxLength: number
): string {
  return typeof value === "string"
    ? value.trim().slice(0, maxLength)
    : "";
}

export async function GET() {
  try {
    await requireAdmin();

    const [
      bankAccounts,
      cardConfigs,
      cryptoOptions,
      paymentConfigs,
    ] = await Promise.all([
      prisma.bankDepositAccount.findMany({
        orderBy: {
          createdAt: "asc",
        },
      }),

      prisma.cardDepositConfig.findMany({
        orderBy: {
          createdAt: "asc",
        },
      }),

      prisma.cryptoDepositOption.findMany({
        orderBy: {
          createdAt: "asc",
        },
      }),

      prisma.paymentDepositConfig.findMany({
        orderBy: {
          createdAt: "asc",
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        bankAccounts,
        cardConfigs,
        cryptoOptions,
        paymentConfigs,
      },
    });
  } catch (error) {
    console.error(
      "Admin deposit configuration GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load deposit configuration.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        {
          status: 400,
        }
      );
    }

    const action =
      typeof body.action === "string"
        ? body.action.trim().toUpperCase()
        : "";

    if (action === "SAVE_BANK") {
      const id = cleanString(body.id, 100);

      const accountName = cleanRequiredString(
        body.accountName,
        200
      );

      const bankName = cleanRequiredString(
        body.bankName,
        200
      );

      const accountNumber = cleanRequiredString(
        body.accountNumber,
        100
      );

      const routingNumber = cleanString(
        body.routingNumber,
        100
      );

      const swiftBic = cleanString(
        body.swiftBic,
        100
      );

      const bankAddress = cleanString(
        body.bankAddress,
        500
      );

      const instructions = cleanString(
        body.instructions,
        3000
      );

      const isEnabled = body.isEnabled !== false;

      if (
        !accountName ||
        !bankName ||
        !accountNumber
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Account name, bank name, and account number are required.",
          },
          {
            status: 400,
          }
        );
      }

      const bankAccount = id
        ? await prisma.bankDepositAccount.update({
            where: {
              id,
            },
            data: {
              accountName,
              bankName,
              accountNumber,
              routingNumber,
              swiftBic,
              bankAddress,
              instructions,
              isEnabled,
            },
          })
        : await prisma.bankDepositAccount.create({
            data: {
              accountName,
              bankName,
              accountNumber,
              routingNumber,
              swiftBic,
              bankAddress,
              instructions,
              isEnabled,
            },
          });

      return NextResponse.json({
        success: true,
        message:
          "Bank transfer settings saved successfully.",
        data: bankAccount,
      });
    }

    if (action === "SAVE_CARD") {
      const id = cleanString(body.id, 100);

      const paymentLink = cleanRequiredString(
        body.paymentLink,
        1000
      );

      const instructions = cleanString(
        body.instructions,
        3000
      );

      const isEnabled = body.isEnabled !== false;

      if (!paymentLink) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Card payment information is required.",
          },
          {
            status: 400,
          }
        );
      }

      const cardConfig = id
        ? await prisma.cardDepositConfig.update({
            where: {
              id,
            },
            data: {
              paymentLink,
              instructions,
              isEnabled,
            },
          })
        : await prisma.cardDepositConfig.create({
            data: {
              paymentLink,
              instructions,
              isEnabled,
            },
          });

      return NextResponse.json({
        success: true,
        message:
          "Card deposit settings saved successfully.",
        data: cardConfig,
      });
    }

    if (action === "SAVE_CRYPTO") {
      const id = cleanString(body.id, 100);

      const asset = cleanRequiredString(
        body.asset,
        100
      );

      const symbol = cleanRequiredString(
        body.symbol,
        50
      ).toUpperCase();

      const network = cleanRequiredString(
        body.network,
        100
      );

      const walletAddress = cleanRequiredString(
        body.walletAddress,
        500
      );

      const instructions = cleanString(
        body.instructions,
        3000
      );

      const isEnabled = body.isEnabled !== false;

      if (
        !asset ||
        !symbol ||
        !network ||
        !walletAddress
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Asset, symbol, network, and wallet address are required.",
          },
          {
            status: 400,
          }
        );
      }

      const cryptoOption = id
        ? await prisma.cryptoDepositOption.update({
            where: {
              id,
            },
            data: {
              asset,
              symbol,
              network,
              walletAddress,
              instructions,
              isEnabled,
            },
          })
        : await prisma.cryptoDepositOption.create({
            data: {
              asset,
              symbol,
              network,
              walletAddress,
              instructions,
              isEnabled,
            },
          });

      return NextResponse.json({
        success: true,
        message:
          "Cryptocurrency deposit settings saved successfully.",
        data: cryptoOption,
      });
    }

    if (action === "SAVE_PAYMENT") {
      const id = cleanString(body.id, 100);

      const methodValue =
        typeof body.method === "string"
          ? body.method.trim().toUpperCase()
          : "";

      if (!isPaymentMethod(methodValue)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid payment method.",
          },
          {
            status: 400,
          }
        );
      }

      const paymentInformation =
        cleanRequiredString(
          body.paymentInformation,
          1000
        );

      const instructions = cleanString(
        body.instructions,
        3000
      );

      const isEnabled = body.isEnabled !== false;

      if (!paymentInformation) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Payment information is required.",
          },
          {
            status: 400,
          }
        );
      }

      let paymentConfig;

      if (id) {
        paymentConfig =
          await prisma.paymentDepositConfig.update({
            where: {
              id,
            },
            data: {
              method: methodValue,
              paymentInformation,
              instructions,
              isEnabled,
            },
          });
      } else {
        paymentConfig =
          await prisma.paymentDepositConfig.upsert({
            where: {
              method: methodValue,
            },
            update: {
              paymentInformation,
              instructions,
              isEnabled,
            },
            create: {
              method: methodValue,
              paymentInformation,
              instructions,
              isEnabled,
            },
          });
      }

      return NextResponse.json({
        success: true,
        message: `${methodValue.replaceAll(
          "_",
          " "
        )} settings saved successfully.`,
        data: paymentConfig,
      });
    }

    if (action === "DELETE_BANK") {
      const id = cleanString(body.id, 100);

      if (!id) {
        return NextResponse.json(
          {
            success: false,
            message: "Bank account ID is required.",
          },
          {
            status: 400,
          }
        );
      }

      await prisma.bankDepositAccount.delete({
        where: {
          id,
        },
      });

      return NextResponse.json({
        success: true,
        message:
          "Bank transfer configuration deleted.",
      });
    }

    if (action === "DELETE_CARD") {
      const id = cleanString(body.id, 100);

      if (!id) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Card configuration ID is required.",
          },
          {
            status: 400,
          }
        );
      }

      await prisma.cardDepositConfig.delete({
        where: {
          id,
        },
      });

      return NextResponse.json({
        success: true,
        message:
          "Card configuration deleted.",
      });
    }

    if (action === "DELETE_CRYPTO") {
      const id = cleanString(body.id, 100);

      if (!id) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Cryptocurrency configuration ID is required.",
          },
          {
            status: 400,
          }
        );
      }

      await prisma.cryptoDepositOption.delete({
        where: {
          id,
        },
      });

      return NextResponse.json({
        success: true,
        message:
          "Cryptocurrency configuration deleted.",
      });
    }

    if (action === "DELETE_PAYMENT") {
      const id = cleanString(body.id, 100);

      if (!id) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Payment configuration ID is required.",
          },
          {
            status: 400,
          }
        );
      }

      await prisma.paymentDepositConfig.delete({
        where: {
          id,
        },
      });

      return NextResponse.json({
        success: true,
        message:
          "Payment configuration deleted.",
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unsupported admin deposit action.",
      },
      {
        status: 400,
      }
    );
  } catch (error) {
    console.error(
      "Admin deposit configuration POST error:",
      error
    );

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown server error.";

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();

    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        {
          status: 400,
        }
      );
    }

    const type =
      typeof body.type === "string"
        ? body.type.trim().toUpperCase()
        : "";

    const id =
      typeof body.id === "string"
        ? body.id.trim()
        : "";

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Configuration ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (type === "BANK") {
      await prisma.bankDepositAccount.delete({
        where: {
          id,
        },
      });
    } else if (type === "CARD") {
      await prisma.cardDepositConfig.delete({
        where: {
          id,
        },
      });
    } else if (type === "CRYPTO") {
      await prisma.cryptoDepositOption.delete({
        where: {
          id,
        },
      });
    } else if (type === "PAYMENT") {
      await prisma.paymentDepositConfig.delete({
        where: {
          id,
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid configuration type.",
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Configuration deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Admin deposit configuration DELETE error:",
      error
    );

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown server error.";

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
      },
      {
        status: 500,
      }
    );
  }
}

