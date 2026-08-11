
import { requireAuthenticatedPage } from "@/lib/auth/guards";
import NotificationsClient from "./NotificationsClient";

export default async function NotificationsPage() {
  await requireAuthenticatedPage();

  return <NotificationsClient />;
}

