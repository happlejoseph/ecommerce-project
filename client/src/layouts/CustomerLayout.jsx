import Navbar from "../components/customer/Navbar";
import CategoryNav from "../components/customer/CategoryNav";
import Footer from "../components/customer/Footer";

const CustomerLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <Navbar />

      <CategoryNav />

      <main className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default CustomerLayout;
