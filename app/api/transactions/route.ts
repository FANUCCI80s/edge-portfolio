import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

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

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
      },
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
        depositId: true,
        withdrawalId: true,
      },
    });

    return NextResponse.json({
      success: true,
      transactions: transactions.map((transaction) => ({
        id: transaction.id,
        type: transaction.type,
        status: transaction.status,
        amount: transaction.amount.toString(),
        currency: transaction.currency,
        description: transaction.description,
        reference: transaction.reference,
        completedAt: transaction.completedAt,
        createdAt: transaction.createdAt,
        depositId: transaction.depositId,
        withdrawalId: transaction.withdrawalId,
      })),
    });
  } catch (error) {
    console.error("Transactions GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load transactions.",
      },
      { status: 500 }
    );
  }
}