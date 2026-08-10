import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const METHODS = [
  "BANK_TRANSFER",
  "CASH_APP",
  "PAYPAL",
  "ZELLE",
  "VENMO",
] as const;

type WithdrawalMethod = (typeof METHODS)[number];

function isWithdrawalMethod(value: string): value is WithdrawalMethod {
  return METHODS.includes(value as WithdrawalMethod);
}

/**
 * GET
 * Returns all withdrawal method configurations.
 */
export async function GET() {
  try {
    const settings = await prisma.withdrawalMethodConfig.findMany({
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("GET withdrawal settings error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load withdrawal settings.",
      },
      { status: 500 },
    );
  }
}

/**
 * PUT
 * Creates or updates a withdrawal method configuration.
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const method = String(body.method ?? "").trim();
    const displayName = String(body.displayName ?? "").trim();
    const instructions =
      body.instructions === null || body.instructions === undefined
        ? null
        : String(body.instructions).trim();

    const isEnabled = Boolean(body.isEnabled);

    if (!method) {
      return NextResponse.json(
        {
          success: false,
          message: "Withdrawal method is required.",
        },
        { status: 400 },
      );
    }

    if (!isWithdrawalMethod(method)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid withdrawal method.",
        },
        { status: 400 },
      );
    }

    if (!displayName) {
      return NextResponse.json(
        {
          success: false,
          message: "Display name is required.",
        },
        { status: 400 },
      );
    }

    const setting = await prisma.withdrawalMethodConfig.upsert({
      where: {
        method,
      },
      update: {
        displayName,
        instructions,
        isEnabled,
      },
      create: {
        method,
        displayName,
        instructions,
        isEnabled,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Withdrawal setting saved successfully.",
      setting,
    });
  } catch (error) {
    console.error("PUT withdrawal settings error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save withdrawal setting.",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE
 * Deletes a withdrawal method configuration.
 */
export async function DELETE(request: Request) {
  try {
    const body = await request.json();

    const method = String(body.method ?? "").trim();

    if (!method || !isWithdrawalMethod(method)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid withdrawal method.",
        },
        { status: 400 },
      );
    }

    await prisma.withdrawalMethodConfig.delete({
      where: {
        method,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Withdrawal setting deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE withdrawal settings error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete withdrawal setting.",
      },
      { status: 500 },
    );
  }
}