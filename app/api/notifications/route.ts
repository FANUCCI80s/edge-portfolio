

import { NextResponse } from "next/server";
import { requireAuthenticatedPage } from "@/lib/auth/guards";

export async function GET() {
  try {
    const user = await requireAuthenticatedPage();

    const notifications = [
      {
        id: "welcome",
        type: "ACCOUNT",
        title: "Welcome to Edge Portfolio",
        message:
          "Your Edge Portfolio account has been successfully created. Complete your account verification to unlock all available features.",
        read: false,
        createdAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      notifications,
      userId: user.id,
    });
  } catch (error) {
    console.error("GET /api/notifications error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAuthenticatedPage();

    const body = await request.json();
    const notificationId = body?.notificationId;

    if (!notificationId) {
      return NextResponse.json(
        {
          success: false,
          message: "Notification ID is required.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notification marked as read.",
      notificationId,
      userId: user.id,
    });
  } catch (error) {
    console.error("PATCH /api/notifications error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }
}

