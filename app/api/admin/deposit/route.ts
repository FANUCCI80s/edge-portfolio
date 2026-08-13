import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";

function serializeDeposit(deposit: any) {
  return {
    ...deposit,
    amount: deposit.amount?.toString() ?? "0",
    transaction: deposit.transaction
      ? {
          ...deposit.transaction,
          amount:
            deposit.transaction.amount?.toString() ?? "0",
        }
      : null,
  };
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);

    const requestedStatus =
      searchParams.get("status") || "PENDING";

    const allowedStatuses = [
      "PENDING",
      "APPROVED",
      "DECLINED",
      "ALL",
    ];

    if (!allowedStatuses.includes(requestedStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid deposit status",
        },
        { status: 400 }
      );
    }

    const deposits =
      await prisma.depositRequest.findMany({
        where:
          requestedStatus === "ALL"
            ? {}
            : {
                status: requestedStatus as
                  | "PENDING"
                  | "APPROVED"
                  | "DECLINED",
              },

        orderBy: {
          createdAt: "desc",
        },

        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },

          bankAccount: {
            select: {
              id: true,
              accountName: true,
              bankName: true,
              accountNumber: true,
              routingNumber: true,
              swiftBic: true,
              bankAddress: true,
              instructions: true,
              isEnabled: true,
            },
          },

          cryptoOption: {
            select: {
              id: true,
              asset: true,
              symbol: true,
              network: true,
              walletAddress: true,
              instructions: true,
              isEnabled: true,
            },
          },

          paymentConfig: {
            select: {
              id: true,
              method: true,
              paymentInformation: true,
              instructions: true,
              isEnabled: true,
            },
          },

          proofFile: {
            select: {
              id: true,
              originalName: true,
              storageKey: true,
              mimeType: true,
              sizeBytes: true,
              createdAt: true,
            },
          },

          invoiceFile: {
            select: {
              id: true,
              originalName: true,
              storageKey: true,
              mimeType: true,
              sizeBytes: true,
              createdAt: true,
            },
          },

          transactions: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
            select: {
              id: true,
              type: true,
              status: true,
              amount: true,
              currency: true,
              description: true,
              reference: true,
              completedAt: true,
              createdAt: true,
            },
          },
        },
      });

    const serialized = deposits.map((deposit) => {
      const latestTransaction =
        deposit.transactions?.[0] ?? null;

      const result = {
        ...deposit,
        amount: deposit.amount.toString(),

        transaction: latestTransaction
          ? {
              ...latestTransaction,
              amount:
                latestTransaction.amount.toString(),
            }
          : null,

        transactions: undefined,
      };

      return result;
    });

    return NextResponse.json({
      success: true,
      deposits: serialized,
      count: serialized.length,
      pendingCount:
        requestedStatus === "PENDING"
          ? serialized.length
          : undefined,
    });
  } catch (error) {
    console.error(
      "Admin deposits GET error:",
      error
    );

    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "FORBIDDEN"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Admin access required",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load deposits",
      },
      { status: 500 }
    );
  }
}