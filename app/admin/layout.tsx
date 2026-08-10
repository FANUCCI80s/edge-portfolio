import { requireAdmin } from "@/lib/auth/session";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-[#080a09] text-white">
      <AdminSidebar />

      <main className="min-h-screen lg:pl-72">
        <div className="px-4 pb-10 pt-24 sm:px-6 lg:px-8 lg:pt-10">
          {children}
        </div>
      </main>
    </div>
  );
}