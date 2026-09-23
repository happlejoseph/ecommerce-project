

import Review from "../models/reviewModel.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";



export const addReview = async(req, res)=> {

    try {

        const {product, rating, comment} = req.body;

        const existingProduct = await Product.findById(product);

        if(!existingProduct) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        const order = await Order.findOne({
            user: req.user._id, status: 'delivered', 'items.product': product
        });

        if(!order) {
            return res.status(403).json({
                message: 'You can review this product only after purchasing it'
            });
        }

        const existingReview = await Review.findOne({
            user: req.user._id, product: product
        });

        if(existingReview) {
            return res.status(400).json({
                message: 'You have already reviewed this product'
            });
        }

        const review = await Review.create({
            user: req.user._id, product: product, rating: rating, comment: comment
        });

        const reviews = await Review.find({
            product: product
        });

        let totalRating  = 0;

        for(const review of reviews) {
            totalRating = totalRating + review.rating;
        }

        const averageRating = totalRating / reviews.length;

        existingProduct.averageRating = averageRating;
        existingReview.numReviews = reviews.length;

        await existingProduct.save();

        res.status(201).json({
            message: 'Review added successfully',
            review: review
        });
    }

    catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
}




export const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                message: "Review not found"
            });
        }

        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You can delete only your own review"
            });
        }

        await review.deleteOne();

        res.status(200).json({
            message: "Review deleted successfully"
        });
    }
    catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};