import { FiFacebook, FiInstagram, FiTwitter, FiMail } from "react-icons/fi";

const Footer = () => {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">

          <div>
            <h2 className="text-xl font-bold">E-COM</h2>
            <p className="mt-3 text-sm text-gray-500">
              Great deals. Better choices. Shop the best products at the
              best prices.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Shop</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li>All Products</li>
              <li>New Arrivals</li>
              <li>Best Sellers</li>
              <li>Offers</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Support</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li>Track Order</li>
              <li>Returns</li>
              <li>Shipping Info</li>
              <li>Contact Us</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Follow Us</h3>
            <div className="mt-3 flex gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:bg-black hover:text-white">
                <FiFacebook size={16} />
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:bg-black hover:text-white">
                <FiInstagram size={16} />
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:bg-black hover:text-white">
                <FiTwitter size={16} />
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:bg-black hover:text-white">
                <FiMail size={16} />
              </span>
            </div>
          </div>

        </div>

        <div className="mt-10 border-t border-gray-100 pt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} E-COM. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
