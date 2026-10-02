

import {createContext, useContext, useEffect, useState} from "react";

import api from "../services/api";

import { useAuth } from "./AuthContext";


const CartContext = createContext(null);

export const CartProvider = ({ children }) => {

    const { isAuthenticated } = useAuth();

    const [cart, setCart] = useState(null);

    const [loading, setLoading] = useState(false);


    let items = [];

    if (cart) {
        items = cart.items;
    }

    let itemCount = 0;

    for (const item of items) {
        itemCount = itemCount + item.quantity;
    }


    const fetchCart = async () => {

        if (!isAuthenticated) {

            setCart(null);

            return;
        }


        setLoading(true);


        try {

            const response = await api.get("/cart");

            setCart(response.data.cart);

        }
        catch (error) {
            setCart(null);

        }
        finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        fetchCart();

    }, [isAuthenticated]);


    const addToCart = async (productId, quantity = 1) => {

        const response = await api.post("/cart/add", {
            productId: productId,
            quantity: quantity
        });


        setCart(response.data.cart);

        await fetchCart();
    };



    const updateCartItem = async (productId, quantity) => {

        const response = await api.patch("/cart", {
            productId: productId,
            quantity: quantity
        });



        setCart(response.data.cart);
    };



    const removeFromCart = async (productId) => {


        await updateCartItem(productId, 0);
    };


    const isInCart = (productId) => {

        for (const item of items) {

            const itemProductId =
                item.product?._id || item.product;


            if (
                itemProductId?.toString() ===
                productId?.toString()
            ) {
                return true;
            }
        }


        return false;
    };


    const clearCartLocally = () => {

        if (cart) {

            setCart({
                ...cart,
                items: []
            });

        }
    };


    let subtotal = 0;


    for (const item of items) {

        const product = item.product;

        if (!product) {
          continue;
        }


        let price = product.price;

        if (product.discount > 0) {

            price = Math.round(product.price * (1 - product.discount / 100));
        }


        subtotal = subtotal + price * item.quantity;
    }



    return (

        <CartContext.Provider
            value={{

                cart: cart,

                items: items,

                itemCount: itemCount,

                loading: loading,

                subtotal: subtotal,

                fetchCart: fetchCart,

                addToCart: addToCart,

                updateCartItem: updateCartItem,

                removeFromCart: removeFromCart,

                isInCart: isInCart,

                clearCartLocally: clearCartLocally

            }}
        >
            {children}
        </CartContext.Provider>
    );
};


export const useCart = () => {

    return useContext(CartContext);

};


export default CartContext;