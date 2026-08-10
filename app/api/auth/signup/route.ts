import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const firstName =
      typeof body.firstName === "string"
        ? body.firstName.trim()
        : "";

    const lastName =
      typeof body.lastName === "string"
        ? body.lastName.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "All required fields must be provided.",
        },
        { status: 400 }
      );
    }

    if (firstName.length > 100 || lastName.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Name is too long.",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must contain at least 8 characters.",
        },
        { status: 400 }
      );
    }

    console.log("[SIGNUP] Step 1: checking existing user");

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    console.log("[SIGNUP] Step 2: hashing password");

    const passwordHash = await hashPassword(password);

    console.log("[SIGNUP] Step 3: creating user");

    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash,
        role: "USER",
        status: "PENDING",
        emailVerified: false,
      },
    });

    console.log("[SIGNUP] User created:", newUser.id);

    try {
      console.log("[SIGNUP] Step 4: creating user profile");

      await prisma.userProfile.create({
        data: {
          userId: newUser.id,
        },
      });

      console.log("[SIGNUP] User profile created");

      console.log("[SIGNUP] Step 5: creating balance");

      await prisma.balance.create({
        data: {
          userId: newUser.id,
          available: 0,
          locked: 0,
        },
      });

      console.log("[SIGNUP] Balance created");

      console.log("[SIGNUP] Step 6: creating KYC record");

      await prisma.kycVerification.create({
        data: {
          userId: newUser.id,
          status: "NOT_STARTED",
        },
      });

      console.log("[SIGNUP] KYC record created");
    } catch (setupError) {
      console.error(
        "[SIGNUP] Account setup failed. Rolling back user:",
        setupError
      );

      try {
        await prisma.user.delete({
          where: {
            id: newUser.id,
          },
        });

        console.log("[SIGNUP] User rollback successful");
      } catch (rollbackError) {
        console.error(
          "[SIGNUP] User rollback failed:",
          rollbackError
        );
      }

      throw setupError;
    }

    console.log("[SIGNUP] SUCCESS");

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully.",
        userId: newUser.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[SIGNUP] FINAL ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create account.",
      },
      { status: 500 }
    );
  }
}