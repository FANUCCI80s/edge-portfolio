import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { Prisma } from "@prisma/client";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const admin = await requireAdmin();

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Transaction ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const transaction =
      await prisma.transaction.findUnique({
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
            },
          },

          deposit: {
            select: {
              id: true,
              method: true,
              status: true,
              reference: true,
              amount: true,
              notes: true,
              proofFileId: true,
              invoiceFileId: true,
              declineReason: true,
              reviewedAt: true,
              createdAt: true,

              selectedBankName: true,
              selectedAccountName: true,
              selectedAccountNumber: true,
              selectedRoutingNumber: true,
              selectedSwiftBic: true,
              selectedBankAddress: true,

              cryptoAsset: true,
              cryptoSymbol: true,
              cryptoNetwork: true,
              cryptoWalletAddress: true,

              paymentInformation: true,
            },
          },

          withdrawal: {
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

              declineReason: true,
              reviewedAt: true,
              createdAt: true,
            },
          },
        },
      });

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          error: "Transaction not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.error(
      "Admin transaction details GET error:",
      error
    );

    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    if (
      error instanceof Error &&
      error.message === "FORBIDDEN"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Admin access required.",
        },
        {
          status: 403,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load transaction.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const admin = await requireAdmin();

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Transaction ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    let body: {
      action?: unknown;
      reason?: unknown;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body.",
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

    if (
      action !== "APPROVE" &&
      action !== "DECLINE"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Action must be APPROVE or DECLINE.",
        },
        {
          status: 400,
        }
      );
    }

    const reason =
      typeof body.reason === "string"
        ? body.reason.trim().slice(0, 1000)
        : "";

    if (action === "DECLINE" && !reason) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A decline reason is required.",
        },
        {
          status: 400,
        }
      );
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const transaction =
          await tx.transaction.findUnique({
            where: {
              id,
            },
            include: {
              deposit: true,
              withdrawal: true,
              user: true,
            },
          });

        if (!transaction) {
          throw new Error("TRANSACTION_NOT_FOUND");
        }

        if (transaction.type === "DEPOSIT") {
          if (!transaction.deposit) {
            throw new Error(
              "DEPOSIT_REQUEST_NOT_FOUND"
            );
          }

          if (
            transaction.status !== "PENDING" ||
            transaction.deposit.status !== "PENDING"
          ) {
            throw new Error(
              "TRANSACTION_ALREADY_REVIEWED"
            );
          }

          if (action === "APPROVE") {
            const balance =
              await tx.balance.findUnique({
                where: {
                  userId: transaction.userId,
                },
              });

            if (balance) {
              await tx.balance.update({
                where: {
                  userId: transaction.userId,
                },
                data: {
                  available: {
                    increment: transaction.amount,
                  },
                },
              });
            } else {
              await tx.balance.create({
                data: {
                  userId: transaction.userId,
                  available: transaction.amount,
                  locked: new Prisma.Decimal(0),
                },
              });
            }

            await tx.depositRequest.update({
              where: {
                id: transaction.deposit.id,
              },
              data: {
                status: "APPROVED",
                reviewedAt: new Date(),
                reviewedById: admin.id,
                reviewAction: "APPROVED",
                declineReason: null,
              },
            });

            await tx.transaction.update({
              where: {
                id: transaction.id,
              },
              data: {
                status: "COMPLETED",
                completedAt: new Date(),
                description:
                  transaction.description ||
                  "Deposit approved",
              },
            });

            await tx.adminApproval.create({
              data: {
                adminId: admin.id,
                userId: transaction.userId,
                depositId: transaction.deposit.id,
                depositRequestId:
                  transaction.deposit.id,
                action: "APPROVED",
              },
            });

            await tx.notification.create({
              data: {
                userId: transaction.userId,
                type: "DEPOSIT",
                title: "Deposit approved",
                message: `Your deposit of ${transaction.currency} ${transaction.amount.toString()} has been approved and added to your available balance.`,
              },
            });

            await tx.accountActivity.create({
              data: {
                userId: transaction.userId,
                type: "DEPOSIT_APPROVED",
                description:
                  "Deposit approved by administrator.",
                metadata: {
                  transactionId: transaction.id,
                  depositId:
                    transaction.deposit.id,
                  amount:
                    transaction.amount.toString(),
                  currency:
                    transaction.currency,
                },
              },
            });

            return {
              action,
              type: "DEPOSIT",
              status: "COMPLETED",
            };
          }

          await tx.depositRequest.update({
            where: {
              id: transaction.deposit.id,
            },
            data: {
              status: "DECLINED",
              reviewedAt: new Date(),
              reviewedById: admin.id,
              reviewAction: "DECLINED",
              declineReason: reason,
            },
          });

          await tx.transaction.update({
            where: {
              id: transaction.id,
            },
            data: {
              status: "FAILED",
              description:
                transaction.description ||
                "Deposit declined",
            },
          });

          await tx.adminApproval.create({
            data: {
              adminId: admin.id,
              userId: transaction.userId,
              depositId: transaction.deposit.id,
              depositRequestId:
                transaction.deposit.id,
              action: "DECLINED",
              reason,
            },
          });

          await tx.notification.create({
            data: {
              userId: transaction.userId,
              type: "DEPOSIT",
              title: "Deposit declined",
              message: `Your deposit request was declined. Reason: ${reason}`,
            },
          });

          await tx.accountActivity.create({
            data: {
              userId: transaction.userId,
              type: "DEPOSIT_DECLINED",
              description:
                "Deposit declined by administrator.",
              metadata: {
                transactionId: transaction.id,
                depositId:
                  transaction.deposit.id,
                reason,
              },
            },
          });

          return {
            action,
            type: "DEPOSIT",
            status: "FAILED",
          };
        }

        if (transaction.type === "WITHDRAWAL") {
          if (!transaction.withdrawal) {
            throw new Error(
              "WITHDRAWAL_REQUEST_NOT_FOUND"
            );
          }

          if (
            transaction.status !== "PENDING" ||
            transaction.withdrawal.status !==
              "PENDING"
          ) {
            throw new Error(
              "TRANSACTION_ALREADY_REVIEWED"
            );
          }

          if (action === "APPROVE") {
            const balance =
              await tx.balance.findUnique({
                where: {
                  userId: transaction.userId,
                },
              });

            if (!balance) {
              throw new Error(
                "INSUFFICIENT_BALANCE"
              );
            }

            if (
              balance.available.lessThan(
                transaction.amount
              )
            ) {
              throw new Error(
                "INSUFFICIENT_BALANCE"
              );
            }

            await tx.balance.update({
              where: {
                userId: transaction.userId,
              },
              data: {
                available: {
                  decrement: transaction.amount,
                },
              },
            });

            await tx.withdrawalRequest.update({
              where: {
                id: transaction.withdrawal.id,
              },
              data: {
                status: "APPROVED",
                reviewedAt: new Date(),
                reviewedById: admin.id,
                reviewAction: "APPROVED",
                declineReason: null,
              },
            });

            await tx.transaction.update({
              where: {
                id: transaction.id,
              },
              data: {
                status: "COMPLETED",
                completedAt: new Date(),
                description:
                  transaction.description ||
                  "Withdrawal approved",
              },
            });

            await tx.adminApproval.create({
              data: {
                adminId: admin.id,
                userId: transaction.userId,
                withdrawalId:
                  transaction.withdrawal.id,
                withdrawalRequestId:
                  transaction.withdrawal.id,
                action: "APPROVED",
              },
            });

            await tx.notification.create({
              data: {
                userId: transaction.userId,
                type: "WITHDRAWAL",
                title: "Withdrawal approved",
                message: `Your withdrawal request of ${transaction.currency} ${transaction.amount.toString()} has been approved.`,
              },
            });

            await tx.accountActivity.create({
              data: {
                userId: transaction.userId,
                type: "WITHDRAWAL_APPROVED",
                description:
                  "Withdrawal approved by administrator.",
                metadata: {
                  transactionId: transaction.id,
                  withdrawalId:
                    transaction.withdrawal.id,
                  amount:
                    transaction.amount.toString(),
                  currency:
                    transaction.currency,
                },
              },
            });

            return {
              action,
              type: "WITHDRAWAL",
              status: "COMPLETED",
            };
          }

          await tx.withdrawalRequest.update({
            where: {
              id: transaction.withdrawal.id,
            },
            data: {
              status: "DECLINED",
              reviewedAt: new Date(),
              reviewedById: admin.id,
              reviewAction: "DECLINED",
              declineReason: reason,
            },
          });

          await tx.transaction.update({
            where: {
              id: transaction.id,
            },
            data: {
              status: "FAILED",
              description:
                transaction.description ||
                "Withdrawal declined",
            },
          });

          await tx.adminApproval.create({
            data: {
              adminId: admin.id,
              userId: transaction.userId,
              withdrawalId:
                transaction.withdrawal.id,
              withdrawalRequestId:
                transaction.withdrawal.id,
              action: "DECLINED",
              reason,
            },
          });

          await tx.notification.create({
            data: {
              userId: transaction.userId,
              type: "WITHDRAWAL",
              title: "Withdrawal declined",
              message: `Your withdrawal request was declined. Reason: ${reason}`,
            },
          });

          await tx.accountActivity.create({
            data: {
              userId: transaction.userId,
              type: "WITHDRAWAL_DECLINED",
              description:
                "Withdrawal declined by administrator.",
              metadata: {
                transactionId: transaction.id,
                withdrawalId:
                  transaction.withdrawal.id,
                reason,
              },
            },
          });

          return {
            action,
            type: "WITHDRAWAL",
            status: "FAILED",
          };
        }

        throw new Error(
          "TRANSACTION_TYPE_NOT_REVIEWABLE"
        );
      }
    );

    return NextResponse.json({
      success: true,
      message:
        result.action === "APPROVE"
          ? `${result.type} approved successfully.`
          : `${result.type} declined successfully.`,
      result,
    });
  } catch (error) {
    console.error(
      "Admin transaction review POST error:",
      error
    );

    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    if (
      error instanceof Error &&
      error.message === "FORBIDDEN"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Admin access required.",
        },
        {
          status: 403,
        }
      );
    }

    if (
      error instanceof Error &&
      error.message === "TRANSACTION_NOT_FOUND"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Transaction not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "TRANSACTION_ALREADY_REVIEWED"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This transaction has already been reviewed.",
        },
        {
          status: 409,
        }
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "INSUFFICIENT_BALANCE"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The user does not have enough available balance to approve this withdrawal.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "DEPOSIT_REQUEST_NOT_FOUND"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The deposit request associated with this transaction was not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "WITHDRAWAL_REQUEST_NOT_FOUND"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The withdrawal request associated with this transaction was not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "TRANSACTION_TYPE_NOT_REVIEWABLE"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Only deposits and withdrawals can be reviewed here.",
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to review transaction.",
      },
      {
        status: 500,
      }
    );
  }
}