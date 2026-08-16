import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const items = cart?.items || [];

  const itemCount = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }

    setLoading(true);

    try {
      const response = await api.get("/cart");
      setCart(response.data.cart);
    } catch (error) {
      // 404 just means no cart created yet
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    const response = await api.post("/cart/add", { productId, quantity });
    setCart(response.data.cart);
    await fetchCart();
  };

  const updateCartItem = async (productId, quantity) => {
    const response = await api.patch("/cart", { productId, quantity });
    setCart(response.data.cart);
  };

  const removeFromCart = async (productId) => {
    await updateCartItem(productId, 0);
  };

  const isInCart = (productId) => {
    return items.some((item) => {
      const itemProductId = item.product?._id || item.product;
      return itemProductId?.toString() === productId?.toString();
    });
  };

  const clearCartLocally = () => {
    setCart((previous) =>
      previous ? { ...previous, items: [] } : previous
    );
  };

  const subtotal = items.reduce((total, item) => {
    const product = item.product;

    if (!product) return total;

    const price =
      product.discount > 0
        ? Math.round(product.price * (1 - product.discount / 100))
        : product.price;

    return total + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        itemCount,
        loading,
        subtotal,
        fetchCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        isInCart,
        clearCartLocally,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

export default CartContext;
