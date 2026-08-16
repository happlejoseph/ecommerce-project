import { useEffect, useRef, useState } from "react";
import {
  FiSearch,
  FiUser,
  FiShoppingCart,
  FiPackage,
  FiHeart,
  FiLogOut,
  FiChevronDown,
  FiSettings,
} from "react-icons/fi";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();

  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-6 px-6">

        {/* Logo */}
        <div className="shrink-0 cursor-pointer" onClick={() => navigate("/")}>
          <h1 className="text-2xl font-bold tracking-tight">
            E-COM
          </h1>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex flex-1">
          <div className="relative w-full">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              className="w-full rounded-lg border border-gray-300 py-3 pl-4 pr-12 text-sm outline-none transition focus:border-black"
            />

            <button
              type="submit"
              className="absolute right-0 top-0 flex h-full w-12 items-center justify-center"
              aria-label="Search"
            >
              <FiSearch size={20} />
            </button>
          </div>
        </form>

        {/* Wishlist */}
        {isAuthenticated && !isAdmin && (
          <button
            onClick={() => navigate("/wishlist")}
            className="hidden items-center gap-2 text-sm font-medium transition hover:opacity-60 md:flex"
          >
            <FiHeart size={21} />
            <span className="hidden lg:block">Wishlist</span>
          </button>
        )}

        {/* Orders */}
        {isAuthenticated && !isAdmin && (
          <button
            onClick={() => navigate("/orders")}
            className="hidden items-center gap-2 text-sm font-medium transition hover:opacity-60 md:flex"
          >
            <FiPackage size={21} />
            <span className="hidden lg:block">Orders</span>
          </button>
        )}

        {/* Cart */}
        {!isAdmin && (
          <button
            onClick={() =>
              isAuthenticated ? navigate("/cart") : navigate("/login")
            }
            className="relative flex items-center gap-2 text-sm font-medium transition hover:opacity-60"
          >
            <FiShoppingCart size={22} />

            <span className="hidden lg:block">Cart</span>

            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-black text-xs text-white">
                {itemCount}
              </span>
            )}
          </button>
        )}

        {/* Auth Area */}
        {isAuthenticated ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((previous) => !previous)}
              className="flex items-center gap-2 text-sm font-medium transition hover:opacity-60"
            >
              <FiUser size={21} />
              <span className="hidden lg:block">{user?.name?.split(" ")[0]}</span>
              <FiChevronDown size={16} className="hidden lg:block" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-12 z-20 w-48 rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
                {isAdmin && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/admin");
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    <FiSettings size={16} />
                    Admin Dashboard
                  </button>
                )}

                {!isAdmin && (
                  <>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/profile");
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-50"
                    >
                      <FiUser size={16} />
                      Profile
                    </button>

                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/orders");
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-50 md:hidden"
                    >
                      <FiPackage size={16} />
                      Orders
                    </button>

                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/wishlist");
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-50 md:hidden"
                    >
                      <FiHeart size={16} />
                      Wishlist
                    </button>
                  </>
                )}

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  <FiLogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 text-sm font-medium transition hover:opacity-60"
          >
            <FiUser size={21} />
            <span className="hidden lg:block">Login</span>
          </button>
        )}

      </div>
    </header>
  );
};

export default Navbar;
