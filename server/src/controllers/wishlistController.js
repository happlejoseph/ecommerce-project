

import Wishlist from "../models/wishlistModel.js";


export const addToWishlist = async(req, res)=> {

    try {

        const {productId} = req.body;

        if(!productId) {
            return res.status(400).json({
                message: 'Product ID required'
            });
        }

        let wishlist = await Wishlist.findOne({
            user: req.user.id
        });

        if(!wishlist) {

            wishlist = await Wishlist.create({
                user: req.user.id,
                products: [productId]
            });
        }

        else {
            const productExists = wishlist.products.some(product=> product.toString() === productId);

            if(productExists) {
                return res.status(400).json({
                    message: 'Product already in wishlist'
                });
            }

            wishlist.products.push(productId);
            await wishlist.save();
        }

        res.status(201).json({
            message: 'Product added to wishlist',
            wishlist
        });

    }
    catch(error) {

        res.status(500).json({
            message: error.message
        });
    }
}




// GET WISHLIST //
export const getWishlist = async(req, res)=> {

    try {

        const wishlist = await Wishlist.findOne({
            user: req.user.id
        }).populate('products');

        if(!wishlist) {
            return res.status(404).json({
                message: 'Wishlist not found'
            });
        }

        res.status(200).json({
            wishlist
        });

    }
    catch(error) {

        res.status(500).json({
            message: error.message
        });
    }
}




// REMOVE FROM WISHLIST //
export const removeFromWishlist = async(req, res)=> {

    try {

        const {productId} = req.body;

        if(!productId) {
            return res.status(400).json({
                message: 'Product Id required'
            });
        }

        const wishlist = await Wishlist.findOne({
            user: req.user.id       
        });
        
        if(!wishlist) {
            return res.status(404).json({
                message: 'Wishlist not found'
            });
        }

        const productIndex = wishlist.products.findIndex(product=> product.toString() === productId);

        if(productIndex === -1) {
            return res.status(404).json({
                message: 'Product not found in wishlist'
            });
        }

        wishlist.products.splice(productIndex, 1)
        
        await wishlist.save();

        res.status(200).json({
            message: 'Product removed from wishlist',
            wishlist
        });
        
    }
    catch(error) {

        res.status(500).json({
            message: error.message
        });
    }
}