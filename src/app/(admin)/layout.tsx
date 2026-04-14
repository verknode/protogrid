import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-ink-shadow">
      <AdminSidebar />
      <main className="flex-1 min-w-0 p-8">{children}</main>
    </div>
  );
}
