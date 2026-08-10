import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { savePrivateFile } from "@/lib/storage";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
] as const;

type DocumentSide = "FRONT" | "BACK";

export async function POST(request: Request) {
  try {
    const user = await requireUser();

    const formData = await request.formData();

    const file = formData.get("file");
    const sideValue = formData.get("side");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "A document file is required.",
        },
        { status: 400 }
      );
    }

    if (
      sideValue !== "FRONT" &&
      sideValue !== "BACK"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Document side must be FRONT or BACK.",
        },
        { status: 400 }
      );
    }

    const side = sideValue as DocumentSide;

    if (file.size <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "The uploaded file is empty.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "File size cannot exceed 10 MB.",
        },
        { status: 400 }
      );
    }

    if (
      !ALLOWED_TYPES.includes(
        file.type as (typeof ALLOWED_TYPES)[number]
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only JPG, PNG, and PDF files are allowed.",
        },
        { status: 400 }
      );
    }

    const kyc = await prisma.kycVerification.findUnique({
      where: {
        userId: user.id,
      },
      include: {
        idFrontFile: true,
        idBackFile: true,
      },
    });

    if (!kyc) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please start your KYC verification before uploading documents.",
        },
        { status: 400 }
      );
    }

    if (kyc.status === "APPROVED") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your KYC verification has already been approved.",
        },
        { status: 409 }
      );
    }

    if (kyc.status === "PENDING") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your KYC verification is already under review.",
        },
        { status: 409 }
      );
    }

    const fileType =
      side === "FRONT"
        ? "GOVERNMENT_ID_FRONT"
        : "GOVERNMENT_ID_BACK";

    const folder =
      side === "FRONT"
        ? `kyc/${user.id}/front`
        : `kyc/${user.id}/back`;

    const stored = await savePrivateFile(
      file,
      folder
    );

    const existingFile =
      side === "FRONT"
        ? kyc.idFrontFile
        : kyc.idBackFile;

    if (existingFile) {
      await prisma.fileAsset.delete({
        where: {
          id: existingFile.id,
        },
      });
    }

    const fileAsset = await prisma.fileAsset.create({
      data: {
        userId: user.id,
        type: fileType,
        originalName: file.name,
        storageKey: stored.storageKey,
        mimeType: file.type,
        sizeBytes: stored.sizeBytes,
      },
    });

    if (side === "FRONT") {
      await prisma.kycVerification.update({
        where: {
          id: kyc.id,
        },
        data: {
          idFrontFile: {
            connect: {
              id: fileAsset.id,
            },
          },
        },
      });
    } else {
      await prisma.kycVerification.update({
        where: {
          id: kyc.id,
        },
        data: {
          idBackFile: {
            connect: {
              id: fileAsset.id,
            },
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Government ID ${side.toLowerCase()} uploaded successfully.`,
      document: {
        id: fileAsset.id,
        side,
        originalName: fileAsset.originalName,
        mimeType: fileAsset.mimeType,
        sizeBytes: fileAsset.sizeBytes,
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You must be logged in to upload KYC documents.",
        },
        { status: 401 }
      );
    }

    console.error("KYC document upload error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to upload your KYC document.",
      },
      { status: 500 }
    );
  }
}