import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);

    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const limitParam = searchParams.get("limit");

    const limit = Math.min(
      Math.max(Number(limitParam) || 100, 1),
      500
    );

    const where: any = {};

    if (
      type &&
      ["DEPOSIT", "WITHDRAWAL", "TRADE", "REFUND", "ADJUSTMENT"].includes(
        type
      )
    ) {
      where.type = type;
    }

    if (
      status &&
      ["PENDING", "COMPLETED", "FAILED", "REVERSED"].includes(status)
    ) {
      where.status = status;
    }

    if (search?.trim()) {
      const searchValue = search.trim();

      where.OR = [
        {
          reference: {
            contains: searchValue,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: searchValue,
            mode: "insensitive",
          },
        },
        {
          user: {
            firstName: {
              contains: searchValue,
              mode: "insensitive",
            },
          },
        },
        {
          user: {
            lastName: {
              contains: searchValue,
              mode: "insensitive",
            },
          },
        },
        {
          user: {
            email: {
              contains: searchValue,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        deposit: {
          select: {
            id: true,
            method: true,
            status: true,
            reference: true,
            amount: true,
            createdAt: true,
          },
        },
        withdrawal: {
          select: {
            id: true,
            method: true,
            status: true,
            amount: true,
            createdAt: true,
          },
        },
      },
    });

    const total = await prisma.transaction.count({
      where,
    });

    const summary = await prisma.transaction.groupBy({
      by: ["status"],
      _count: {
        _all: true,
      },
      where,
    });

    const summaryByStatus = {
      pending: 0,
      completed: 0,
      failed: 0,
      reversed: 0,
    };

    for (const item of summary) {
      if (item.status === "PENDING") {
        summaryByStatus.pending = item._count._all;
      }

      if (item.status === "COMPLETED") {
        summaryByStatus.completed = item._count._all;
      }

      if (item.status === "FAILED") {
        summaryByStatus.failed = item._count._all;
      }

      if (item.status === "REVERSED") {
        summaryByStatus.reversed = item._count._all;
      }
    }

    return NextResponse.json({
      success: true,
      transactions,
      total,
      limit,
      summary: {
        total,
        ...summaryByStatus,
      },
    });
  } catch (error) {
    console.error("Admin transactions GET error:", error);

    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
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
          error: "Admin access required",
        },
        {
          status: 403,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load transactions",
      },
      {
        status: 500,
      }
    );
  }
}