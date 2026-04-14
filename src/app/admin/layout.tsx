import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "Admin — ProtoGrid",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <AdminSidebar />
      <main className="flex-1 min-w-0 p-8 lg:p-10">{children}</main>
    </div>
  );
}
