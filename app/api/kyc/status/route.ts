import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";

export async function GET() {
  try {
    const user = await requireUser();

    const kyc = await prisma.kycVerification.findUnique({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        status: true,
        submittedAt: true,
        reviewedAt: true,
        declineReason: true,
        dateOfBirth: true,
        nationality: true,
        countryOfResidence: true,
        residentialAddress: true,
        city: true,
        state: true,
        postalCode: true,
        governmentIdType: true,
        governmentIdNumber: true,
        idFrontFile: {
          select: {
            id: true,
            originalName: true,
            mimeType: true,
            sizeBytes: true,
          },
        },
        idBackFile: {
          select: {
            id: true,
            originalName: true,
            mimeType: true,
            sizeBytes: true,
          },
        },
      },
    });

    if (!kyc) {
      return NextResponse.json(
        {
          success: false,
          message: "KYC verification record was not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      kyc,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be logged in.",
        },
        { status: 401 }
      );
    }

    console.error("KYC status error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load KYC status.",
      },
      { status: 500 }
    );
  }
}