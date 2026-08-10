import { redirect } from "next/navigation";
import {
  getCurrentUser,
  requireAdmin,
  requireApprovedKyc,
  requireUser,
} from "@/lib/auth/session";

export async function requireAuthenticatedUser() {
  const user = await requireUser();

  return user;
}

export async function requireKycApprovedUser() {
  const user = await requireApprovedKyc();

  return user;
}

export async function requireAuthenticatedPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireKycApprovedPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.kyc?.status !== "APPROVED") {
    redirect("/kyc");
  }

  return user;
}

export async function requireAdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return user;
}