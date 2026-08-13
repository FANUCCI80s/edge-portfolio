import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type ReviewAction = "APPROVE" | "DECLINE";

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
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.findUnique({
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
          },
        },

        deposit: {
          include: {
            bankAccount: true,
            cryptoOption: true,
            paymentConfig: true,
            proofFile: true,
            invoiceFile: true,
          },
        },

        withdrawal: true,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          error: "Transaction not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      transaction,
      admin: {
        id: admin.id,
      },
    });
  } catch (error) {
    console.error("Admin transaction GET error:", error);

    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
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
          error: "Admin access required.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load transaction.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
        { status: 400 }
      );
    }

    let body: {
      action?: ReviewAction;
      reason?: string;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON request body.",
        },
        { status: 400 }
      );
    }

    const action = body.action;

    if (action !== "APPROVE" && action !== "DECLINE") {
      return NextResponse.json(
        {
          success: false,
          error: "Action must be APPROVE or DECLINE.",
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
          error: "A decline reason is required.",
        },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const transaction = await tx.transaction.findUnique({
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
            deposit: true,
            withdrawal: true,
          },
        });

        if (!transaction) {
          throw new Error("TRANSACTION_NOT_FOUND");
        }

        if (
          transaction.type !== "DEPOSIT" &&
          transaction.type !== "WITHDRAWAL"
        ) {
          throw new Error(
            "ONLY_DEPOSIT_WITHDRAWAL_REVIEWS_SUPPORTED"
          );
        }

        if (transaction.status !== "PENDING") {
          throw new Error("TRANSACTION_ALREADY_REVIEWED");
        }

        /*
         * =====================================================
         * DEPOSIT REVIEW
         * =====================================================
         */

        if (
          transaction.type === "DEPOSIT" &&
          transaction.deposit
        ) {
          const deposit = transaction.deposit;

          if (deposit.status !== "PENDING") {
            throw new Error("DEPOSIT_ALREADY_REVIEWED");
          }

          if (action === "APPROVE") {
            /*
             * Update the deposit request.
             */
            await tx.depositRequest.update({
              where: {
                id: deposit.id,
              },
              data: {
                status: "APPROVED",
                reviewedAt: new Date(),
                reviewedById: admin.id,
                reviewAction: "APPROVED",
                declineReason: null,
              },
            });

            /*
             * Update the transaction.
             */
            const updatedTransaction =
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

            /*
             * Make sure the user has a balance record.
             */
            const balance = await tx.balance.upsert({
              where: {
                userId: transaction.userId,
              },
              create: {
                userId: transaction.userId,
                available: transaction.amount,
                locked: 0,
              },
              update: {
                available: {
                  increment: transaction.amount,
                },
              },
            });

            /*
             * Record the admin approval.
             */
            await tx.adminApproval.create({
              data: {
                adminId: admin.id,
                userId: transaction.userId,
                depositRequestId: deposit.id,
                action: "APPROVED",
                reason: null,
              },
            });

            /*
             * Record account activity.
             */
            await tx.accountActivity.create({
              data: {
                userId: transaction.userId,
                type: "DEPOSIT_APPROVED",
                description: `Deposit of ${transaction.currency} ${transaction.amount.toString()} approved by admin.`,
                metadata: {
                  transactionId: transaction.id,
                  depositId: deposit.id,
                  adminId: admin.id,
                  amount: transaction.amount.toString(),
                  currency: transaction.currency,
                },
              },
            });

            /*
             * Create notification for user.
             */
            await tx.notification.create({
              data: {
                userId: transaction.userId,
                type: "DEPOSIT",
                title: "Deposit Approved",
                message: `Your deposit of ${transaction.currency} ${transaction.amount.toString()} has been approved and added to your available balance.`,
              },
            });

            return {
              transaction: updatedTransaction,
              balance,
              action: "APPROVED",
            };
          }

          /*
           * Deposit declined.
           */
          await tx.depositRequest.update({
            where: {
              id: deposit.id,
            },
            data: {
              status: "DECLINED",
              reviewedAt: new Date(),
              reviewedById: admin.id,
              reviewAction: "DECLINED",
              declineReason: reason,
            },
          });

          const updatedTransaction =
            await tx.transaction.update({
              where: {
                id: transaction.id,
              },
              data: {
                status: "FAILED",
                completedAt: new Date(),
                description:
                  transaction.description ||
                  "Deposit declined",
              },
            });

          await tx.adminApproval.create({
            data: {
              adminId: admin.id,
              userId: transaction.userId,
              depositRequestId: deposit.id,
              action: "DECLINED",
              reason,
            },
          });

          await tx.accountActivity.create({
            data: {
              userId: transaction.userId,
              type: "DEPOSIT_DECLINED",
              description: `Deposit of ${transaction.currency} ${transaction.amount.toString()} was declined by admin.`,
              metadata: {
                transactionId: transaction.id,
                depositId: deposit.id,
                adminId: admin.id,
                reason,
                amount: transaction.amount.toString(),
                currency: transaction.currency,
              },
            },
          });

          await tx.notification.create({
            data: {
              userId: transaction.userId,
              type: "DEPOSIT",
              title: "Deposit Declined",
              message: `Your deposit of ${transaction.currency} ${transaction.amount.toString()} was declined. Reason: ${reason}`,
            },
          });

          return {
            transaction: updatedTransaction,
            action: "DECLINED",
          };
        }

        /*
         * =====================================================
         * WITHDRAWAL REVIEW
         * =====================================================
         */

        if (
          transaction.type === "WITHDRAWAL" &&
          transaction.withdrawal
        ) {
          const withdrawal = transaction.withdrawal;

          if (withdrawal.status !== "PENDING") {
            throw new Error("WITHDRAWAL_ALREADY_REVIEWED");
          }

          if (action === "APPROVE") {
            /*
             * Make sure the balance exists.
             */
            const balance = await tx.balance.findUnique({
              where: {
                userId: transaction.userId,
              },
            });

            if (!balance) {
              throw new Error("BALANCE_NOT_FOUND");
            }

            /*
             * Verify that the user has enough available
             * balance before approving the withdrawal.
             */
            if (balance.available.lt(transaction.amount)) {
              throw new Error("INSUFFICIENT_BALANCE");
            }

            /*
             * Deduct the withdrawal from available balance.
             */
            const updatedBalance = await tx.balance.update({
              where: {
                userId: transaction.userId,
              },
              data: {
                available: {
                  decrement: transaction.amount,
                },
              },
            });

            /*
             * Update withdrawal request.
             */
            await tx.withdrawalRequest.update({
              where: {
                id: withdrawal.id,
              },
              data: {
                status: "APPROVED",
                reviewedAt: new Date(),
                reviewedById: admin.id,
                reviewAction: "APPROVED",
                declineReason: null,
              },
            });

            /*
             * Update transaction.
             */
            const updatedTransaction =
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

            /*
             * Record admin approval.
             */
            await tx.adminApproval.create({
              data: {
                adminId: admin.id,
                userId: transaction.userId,
                withdrawalRequestId: withdrawal.id,
                action: "APPROVED",
                reason: null,
              },
            });

            /*
             * Record account activity.
             */
            await tx.accountActivity.create({
              data: {
                userId: transaction.userId,
                type: "WITHDRAWAL_APPROVED",
                description: `Withdrawal of ${transaction.currency} ${transaction.amount.toString()} approved by admin.`,
                metadata: {
                  transactionId: transaction.id,
                  withdrawalId: withdrawal.id,
                  adminId: admin.id,
                  amount: transaction.amount.toString(),
                  currency: transaction.currency,
                },
              },
            });

            /*
             * Notify user.
             */
            await tx.notification.create({
              data: {
                userId: transaction.userId,
                type: "WITHDRAWAL",
                title: "Withdrawal Approved",
                message: `Your withdrawal of ${transaction.currency} ${transaction.amount.toString()} has been approved.`,
              },
            });

            return {
              transaction: updatedTransaction,
              balance: updatedBalance,
              action: "APPROVED",
            };
          }

          /*
           * Withdrawal declined.
           *
           * No balance is deducted because the withdrawal
           * has not been approved.
           */
          await tx.withdrawalRequest.update({
            where: {
              id: withdrawal.id,
            },
            data: {
              status: "DECLINED",
              reviewedAt: new Date(),
              reviewedById: admin.id,
              reviewAction: "DECLINED",
              declineReason: reason,
            },
          });

          const updatedTransaction =
            await tx.transaction.update({
              where: {
                id: transaction.id,
              },
              data: {
                status: "FAILED",
                completedAt: new Date(),
                description:
                  transaction.description ||
                  "Withdrawal declined",
              },
            });

          await tx.adminApproval.create({
            data: {
              adminId: admin.id,
              userId: transaction.userId,
              withdrawalRequestId: withdrawal.id,
              action: "DECLINED",
              reason,
            },
          });

          await tx.accountActivity.create({
            data: {
              userId: transaction.userId,
              type: "WITHDRAWAL_DECLINED",
              description: `Withdrawal of ${transaction.currency} ${transaction.amount.toString()} was declined by admin.`,
              metadata: {
                transactionId: transaction.id,
                withdrawalId: withdrawal.id,
                adminId: admin.id,
                reason,
                amount: transaction.amount.toString(),
                currency: transaction.currency,
              },
            },
          });

          await tx.notification.create({
            data: {
              userId: transaction.userId,
              type: "WITHDRAWAL",
              title: "Withdrawal Declined",
              message: `Your withdrawal of ${transaction.currency} ${transaction.amount.toString()} was declined. Reason: ${reason}`,
            },
          });

          return {
            transaction: updatedTransaction,
            action: "DECLINED",
          };
        }

        throw new Error("REVIEW_REQUEST_NOT_FOUND");
      },
      {
        isolationLevel: "Serializable",
      }
    );

    return NextResponse.json({
      success: true,
      message:
        result.action === "APPROVED"
          ? "Request approved successfully."
          : "Request declined successfully.",
      action: result.action,
      transaction: result.transaction,
      balance: result.balance ?? null,
    });
  } catch (error) {
    console.error("Admin transaction PATCH error:", error);

    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
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
          error: "Admin access required.",
        },
        { status: 403 }
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
        { status: 404 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "TRANSACTION_ALREADY_REVIEWED"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "This transaction has already been reviewed.",
        },
        { status: 409 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "DEPOSIT_ALREADY_REVIEWED"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "This deposit request has already been reviewed.",
        },
        { status: 409 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "WITHDRAWAL_ALREADY_REVIEWED"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This withdrawal request has already been reviewed.",
        },
        { status: 409 }
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "ONLY_DEPOSIT_WITHDRAWAL_REVIEWS_SUPPORTED"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Only deposit and withdrawal transactions can be reviewed here.",
        },
        { status: 400 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "REVIEW_REQUEST_NOT_FOUND"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The review request associated with this transaction could not be found.",
        },
        { status: 404 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "BALANCE_NOT_FOUND"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The user's balance account could not be found.",
        },
        { status: 400 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "INSUFFICIENT_BALANCE"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The user does not have enough available balance to approve this withdrawal.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to process transaction review.",
      },
      { status: 500 }
    );
  }
}