import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function getAdminId(admin: unknown): string | null {
  if (
    typeof admin === "object" &&
    admin !== null &&
    "id" in admin &&
    typeof admin.id === "string"
  ) {
    return admin.id;
  }

  if (
    typeof admin === "object" &&
    admin !== null &&
    "user" in admin &&
    typeof admin.user === "object" &&
    admin.user !== null &&
    "id" in admin.user &&
    typeof admin.user.id === "string"
  ) {
    return admin.user.id;
  }

  return null;
}

async function getDeposit(id: string) {
  return prisma.depositRequest.findUnique({
    where: {
      id,
    },

    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          status: true,
          createdAt: true,
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
}

function serializeDeposit(deposit: any) {
  return {
    ...deposit,

    amount: deposit.amount?.toString() ?? "0",

    transactions:
      deposit.transactions?.map(
        (transaction: any) => ({
          ...transaction,
          amount:
            transaction.amount?.toString() ?? "0",
        })
      ) ?? [],
  };
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await requireAdmin();

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Deposit ID is required",
        },
        { status: 400 }
      );
    }

    const deposit = await getDeposit(id);

    if (!deposit) {
      return NextResponse.json(
        {
          success: false,
          error: "Deposit request not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      deposit: serializeDeposit(deposit),
    });
  } catch (error) {
    console.error(
      "Admin deposit GET error:",
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
        error: "Unable to load deposit request",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const admin = await requireAdmin();

    const adminId = getAdminId(admin);

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Deposit ID is required",
        },
        { status: 400 }
      );
    }

    let body: {
      action?: "APPROVE" | "DECLINE";
      reason?: string;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body",
        },
        { status: 400 }
      );
    }

    const action = body.action;

    if (
      action !== "APPROVE" &&
      action !== "DECLINE"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Action must be APPROVE or DECLINE",
        },
        { status: 400 }
      );
    }

    const reason =
      typeof body.reason === "string"
        ? body.reason.trim()
        : "";

    if (action === "DECLINE" && !reason) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A reason is required when declining a deposit",
        },
        { status: 400 }
      );
    }

    if (reason.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Decline reason cannot exceed 1000 characters",
        },
        { status: 400 }
      );
    }

    const result =
      await prisma.$transaction(
        async (tx) => {
          /*
           * Atomically claim the pending deposit.
           *
           * This prevents two admins from approving
           * the same deposit at the same time.
           */
          const claimed =
            await tx.depositRequest.updateMany({
              where: {
                id,
                status: "PENDING",
              },

              data: {
                status:
                  action === "APPROVE"
                    ? "APPROVED"
                    : "DECLINED",

                reviewedAt: new Date(),

                reviewedById:
                  adminId || undefined,

                reviewAction:
                  action === "APPROVE"
                    ? "APPROVED"
                    : "DECLINED",

                declineReason:
                  action === "DECLINE"
                    ? reason
                    : null,
              },
            });

          if (claimed.count !== 1) {
            const existing =
              await tx.depositRequest.findUnique(
                {
                  where: {
                    id,
                  },

                  select: {
                    id: true,
                    status: true,
                  },
                }
              );

            if (!existing) {
              throw new Error(
                "DEPOSIT_NOT_FOUND"
              );
            }

            throw new Error(
              "DEPOSIT_ALREADY_REVIEWED"
            );
          }

          const deposit =
            await tx.depositRequest.findUnique({
              where: {
                id,
              },

              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },

                transactions: {
                  orderBy: {
                    createdAt: "desc",
                  },

                  take: 1,
                },
              },
            });

          if (!deposit) {
            throw new Error(
              "DEPOSIT_NOT_FOUND"
            );
          }

          const now = new Date();

          /*
           * ==========================================
           * DECLINE
           * ==========================================
           */
          if (action === "DECLINE") {
            const existingTransaction =
              deposit.transactions[0];

            if (existingTransaction) {
              await tx.transaction.update({
                where: {
                  id: existingTransaction.id,
                },

                data: {
                  status: "FAILED",

                  description:
                    existingTransaction.description ||
                    "Deposit declined",
                },
              });
            } else {
              await tx.transaction.create({
                data: {
                  userId: deposit.userId,
                  type: "DEPOSIT",
                  status: "FAILED",
                  amount: deposit.amount,
                  currency: "USD",
                  description:
                    "Deposit declined",
                  reference:
                    deposit.reference,
                  depositId: deposit.id,
                },
              });
            }

            if (adminId) {
              await tx.adminApproval.create({
                data: {
                  adminId,
                  userId: deposit.userId,
                  action: "DECLINED",
                  reason,

                  depositRequestId:
                    deposit.id,

                  depositId: deposit.id,
                },
              });
            }

            await tx.notification.create({
              data: {
                userId: deposit.userId,

                type: "DEPOSIT",

                title: "Deposit Declined",

                message:
                  `Your deposit request of USD ${deposit.amount.toString()} was declined.` +
                  ` Reason: ${reason}`,
              },
            });

            await tx.accountActivity.create({
              data: {
                userId: deposit.userId,

                type: "DEPOSIT_DECLINED",

                description:
                  "Deposit request was declined by an administrator.",

                metadata: {
                  depositId: deposit.id,
                  amount:
                    deposit.amount.toString(),
                  reason,
                },
              },
            });

            return {
              action,
              depositId: deposit.id,
              status: "DECLINED",
            };
          }

          /*
           * ==========================================
           * APPROVE
           * ==========================================
           */

          const existingTransaction =
            deposit.transactions[0];

          if (existingTransaction) {
            await tx.transaction.update({
              where: {
                id: existingTransaction.id,
              },

              data: {
                status: "COMPLETED",
                completedAt: now,

                description:
                  existingTransaction.description ||
                  "Deposit approved",
              },
            });
          } else {
            await tx.transaction.create({
              data: {
                userId: deposit.userId,
                type: "DEPOSIT",
                status: "COMPLETED",
                amount: deposit.amount,
                currency: "USD",
                description:
                  "Deposit approved",
                reference:
                  deposit.reference,
                completedAt: now,
                depositId: deposit.id,
              },
            });
          }

          /*
           * Credit available balance.
           */
          await tx.balance.upsert({
            where: {
              userId: deposit.userId,
            },

            create: {
              userId: deposit.userId,
              available: deposit.amount,
              locked: 0,
            },

            update: {
              available: {
                increment: deposit.amount,
              },
            },
          });

          /*
           * Admin audit record.
           */
          if (adminId) {
            await tx.adminApproval.create({
              data: {
                adminId,
                userId: deposit.userId,
                action: "APPROVED",
                reason: null,

                depositRequestId:
                  deposit.id,

                depositId: deposit.id,
              },
            });
          }

          /*
           * User notification.
           */
          await tx.notification.create({
            data: {
              userId: deposit.userId,

              type: "DEPOSIT",

              title: "Deposit Approved",

              message:
                `Your deposit of USD ${deposit.amount.toString()} has been approved and added to your available balance.`,
            },
          });

          /*
           * Account activity.
           */
          await tx.accountActivity.create({
            data: {
              userId: deposit.userId,

              type: "DEPOSIT_APPROVED",

              description:
                "Deposit was approved and credited to the user's balance.",

              metadata: {
                depositId: deposit.id,

                amount:
                  deposit.amount.toString(),

                currency: "USD",
              },
            },
          });

          return {
            action,
            depositId: deposit.id,
            status: "APPROVED",
          };
        }
      );

    return NextResponse.json({
      success: true,

      message:
        action === "APPROVE"
          ? "Deposit approved successfully"
          : "Deposit declined successfully",

      result,
    });
  } catch (error) {
    console.error(
      "Admin deposit POST error:",
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

    if (
      error instanceof Error &&
      error.message === "DEPOSIT_NOT_FOUND"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Deposit request not found",
        },
        { status: 404 }
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "DEPOSIT_ALREADY_REVIEWED"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This deposit has already been reviewed",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to process deposit review",
      },
      { status: 500 }
    );
  }
}