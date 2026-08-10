import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/auth/guards";

export async function GET() {
  try {
    await requireAdminPage();

    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,

        kyc: {
          select: {
            status: true,
          },
        },

        balance: {
          select: {
            available: true,
          },
        },
      },
    });

    const formattedUsers = users.map((user) => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt.toISOString(),

      kyc: user.kyc
        ? {
            status: user.kyc.status,
          }
        : null,

      balance: user.balance
        ? {
            available: Number(user.balance.available),
            total: Number(user.balance.available),
          }
        : {
            available: 0,
            total: 0,
          },
    }));

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      count: formattedUsers.length,
    });
  } catch (error) {
    console.error("ADMIN USERS API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load users.",
        users: [],
      },
      {
        status: 500,
      }
    );
  }
}