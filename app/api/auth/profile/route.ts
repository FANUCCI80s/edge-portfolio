
import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();

    const profile = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          message: "User account was not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: profile,
    });
  } catch (error) {
    console.error("GET /api/auth/profile error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load your profile.",
      },
      { status: 401 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAuthenticatedUser();

    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const phone =
      typeof body.phone === "string"
        ? body.phone.trim()
        : null;

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email address is required.",
        },
        { status: 400 }
      );
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    const existingUser =
      await prisma.user.findFirst({
        where: {
          email,
          NOT: {
            id: user.id,
          },
        },
        select: {
          id: true,
        },
      });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            "That email address is already being used by another account.",
        },
        { status: 409 }
      );
    }

    const updatedUser =
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          email,
          phone: phone || null,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      });

    return NextResponse.json({
      success: true,
      message: "Your profile has been updated.",
      user: updatedUser,
    });
  } catch (error) {
    console.error(
      "PATCH /api/auth/profile error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update your profile.",
      },
      { status: 500 }
    );
  }
}

