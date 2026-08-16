import AdminSidebar from "../components/admin/AdminSidebar";

const AdminLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50 text-black">
      <AdminSidebar />

      <main className="flex-1 overflow-x-hidden p-8">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
