import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

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
    await requireAdmin();

    const { id } = await context.params;

    const side = request.nextUrl.searchParams.get("side");

    if (side !== "front" && side !== "back") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid document side.",
        },
        { status: 400 }
      );
    }

    const kyc = await prisma.kycVerification.findUnique({
      where: {
        id,
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
          message: "KYC application not found.",
        },
        { status: 404 }
      );
    }

    const file =
      side === "front"
        ? kyc.idFrontFile
        : kyc.idBackFile;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "Requested document is not available.",
        },
        { status: 404 }
      );
    }

    const filePath = path.resolve(file.storageKey);

    const fileBuffer = await readFile(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": file.mimeType || "application/octet-stream",
        "Content-Length": fileBuffer.length.toString(),
        "Content-Disposition": `inline; filename="${encodeURIComponent(
          file.originalName
        )}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("KYC document error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to open the KYC document.",
      },
      { status: 500 }
    );
  }
}