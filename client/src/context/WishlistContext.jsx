import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(false);

  const products = wishlist?.products || [];

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist(null);
      return;
    }

    setLoading(true);

    try {
      const response = await api.get("/wishlist");
      setWishlist(response.data.wishlist);
    } catch (error) {
      setWishlist(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = (productId) =>
    products.some((product) => product._id === productId);

  const addToWishlist = async (productId) => {
    const response = await api.post("/wishlist/add", { productId });
    setWishlist(response.data.wishlist);
    await fetchWishlist();
  };

  const removeFromWishlist = async (productId) => {
    const response = await api.delete("/wishlist/remove", {
      data: { productId },
    });
    setWishlist(response.data.wishlist);
  };

  const toggleWishlist = async (productId) => {
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        products,
        loading,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);

export default WishlistContext;
