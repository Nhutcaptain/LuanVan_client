import AdminSidebarMenu from "@/components/AdminSidebar/AdminSidebarMenu";
import DoctorSidebarComponent from "@/components/DoctorSidebarMenu/DoctorSidebarMenuComponent";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-container flex gap-5">
        <AdminSidebarMenu></AdminSidebarMenu>
      <main className="flex-1 px-6">{children}</main>
    </div>
  );
}