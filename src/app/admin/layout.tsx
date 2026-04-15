import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "Admin — ProtoGrid",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <AdminSidebar />
      <main className="flex-1 min-w-0 p-6 lg:p-10">{children}</main>
    </div>
  );
}
