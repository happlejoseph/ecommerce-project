

import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";




// ADD TO CART //
export const addToCart = async(req, res)=> {

    try {

        const {productId, quantity} = req.body;

        const requestedQty = Number(quantity) || 1;

        if(requestedQty < 1) {
            return res.status(400).json({
                message: 'Quantity must be at least 1'
            });
        }

        const product = await Product.findById(productId);

        if(!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        let cart = await Cart.findOne({
            user: req.user.id
        });

        if(!cart) {

            if(requestedQty > product.stock) {
                return res.status(400).json({
                    message: `Only ${product.stock} item(s) in stock`
                });
            }

            cart = await Cart.create({
                user: req.user.id,

                items: [
                    {
                        product: productId,
                        quantity: requestedQty
                    }
                ]
            });
        }

        else {
            const itemIndex = cart.items.findIndex(item=> item.product.toString() === productId);

            if(itemIndex > -1){

                const newQuantity = cart.items[itemIndex].quantity + requestedQty;

                if(newQuantity > product.stock) {
                    return res.status(400).json({
                        message: `Only ${product.stock} item(s) in stock`
                    });
                }

                cart.items[itemIndex].quantity = newQuantity;
            }

            else {

                if(requestedQty > product.stock) {
                    return res.status(400).json({
                        message: `Only ${product.stock} item(s) in stock`
                    });
                }

                cart.items.push({
                    product: productId,
                    quantity: requestedQty
                });
            }

            await cart.save();
        }

        res.status(201).json({
            message: 'Product added to cart',
            cart
        });

    }
    catch(error) {

        res.status(500).json({
            message: error.message
        });
    }
}



// GET CART //
export const getCart = async(req, res)=> {

    try {

        const cart = await Cart.findOne({
            user: req.user.id
        }).populate('items.product');

        if(!cart) {
            return res.status(404).json({
                message: 'Cart not found'
            });
        }

        res.status(200).json({
            cart
        });

    }
    catch(error) {

        res.status(500).json({
            message: error.message
        });
    }
}




// UPDATE CART //
export const updateCart = async(req, res)=> {

    try {

        const {productId, quantity} = req.body;

        const numericQuantity = Number(quantity);

        if(Number.isNaN(numericQuantity)) {
            return res.status(400).json({
                message: 'Quantity must be a number'
            });
        }

        const cart = await Cart.findOne({
            user: req.user.id
        });

        if(!cart) {
            return res.status(404).json({
                message: 'Cart not found'
            });
        }

        // find product inside cart
        const itemIndex = cart.items.findIndex(item=> item.product.toString() === productId);

        if(itemIndex === -1) {
            return res.status(404).json({
                message: 'Product not found in cart'
            });
        }

        if(numericQuantity <= 0) {
            cart.items.splice(itemIndex, 1);
        }

        else {

            const product = await Product.findById(productId);

            if(!product) {
                return res.status(404).json({
                    message: 'Product not found'
                });
            }

            if(numericQuantity > product.stock) {
                return res.status(400).json({
                    message: `Only ${product.stock} item(s) in stock`
                });
            }

            // update quantity
            cart.items[itemIndex].quantity = numericQuantity;
        }

        await cart.save();

        res.status(200).json({
            message: numericQuantity <= 0 ? 'Product removed from cart' : 'Cart updated successfully',
            cart
        });
        
    }
    catch(error) {

        res.status(500).json({
            message: error.message
        });
    }
}