

import Review from "../models/reviewModel.js";
import Product from "../models/productModel.js";


// Recalculate a product's average rating + review count.
// Called after any review is added, edited, or deleted.
const refreshProductRatingStats = async(productId)=> {

    const reviews = await Review.find({ product: productId });

    const numReviews = reviews.length;

    const averageRating = numReviews === 0
        ? 0
        : reviews.reduce((sum, review)=> sum + review.rating, 0) / numReviews;

    await Product.findByIdAndUpdate(productId, {
        averageRating: Math.round(averageRating * 10) / 10, // round to 1 decimal
        numReviews
    });
}



// ADD REVIEW //
export const addReview = async(req, res)=> {

    try {

        const { productId, rating, comment } = req.body;

        if(!productId || !rating || !comment || !comment.trim()) {
            return res.status(400).json({
                message: 'Product, rating and comment are required'
            });
        }

        const product = await Product.findById(productId);

        if(!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        const existingReview = await Review.findOne({
            user: req.user.id,
            product: productId
        });

        if(existingReview) {
            return res.status(400).json({
                message: 'You have already reviewed this product'
            });
        }

        const review = await Review.create({
            user: req.user.id,
            product: productId,
            rating,
            comment: comment.trim()
        });

        await refreshProductRatingStats(productId);

        const populatedReview = await review.populate('user', 'name');

        res.status(201).json({
            message: 'Review added successfully',
            review: populatedReview
        });

    }
    catch(error) {

        // duplicate key error, as a fallback safety net
        if(error.code === 11000) {
            return res.status(400).json({
                message: 'You have already reviewed this product'
            });
        }

        res.status(500).json({
            message: error.message
        });
    }
}



// GET REVIEWS FOR A PRODUCT //
export const getProductReviews = async(req, res)=> {

    try {

        const reviews = await Review.find({
            product: req.params.productId
        })
        .populate('user', 'name')
        .sort({ createdAt: -1 });

        res.status(200).json({
            reviews
        });

    }
    catch(error) {

        res.status(500).json({
            message: error.message
        });
    }
}



// GET MY REVIEW FOR A PRODUCT //
export const getMyReview = async(req, res)=> {

    try {

        const review = await Review.findOne({
            user: req.user.id,
            product: req.params.productId
        });

        res.status(200).json({
            review: review || null
        });

    }
    catch(error) {

        res.status(500).json({
            message: error.message
        });
    }
}



// UPDATE REVIEW //
export const updateReview = async(req, res)=> {

    try {

        const { rating, comment } = req.body;

        const review = await Review.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if(!review) {
            return res.status(404).json({
                message: 'Review not found'
            });
        }

        if(rating) review.rating = rating;
        if(comment) review.comment = comment.trim();

        await review.save();
        await refreshProductRatingStats(review.product);

        const populatedReview = await review.populate('user', 'name');

        res.status(200).json({
            message: 'Review updated successfully',
            review: populatedReview
        });

    }
    catch(error) {

        res.status(500).json({
            message: error.message
        });
    }
}



// DELETE REVIEW //
export const deleteReview = async(req, res)=> {

    try {

        const review = await Review.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if(!review) {
            return res.status(404).json({
                message: 'Review not found'
            });
        }

        const productId = review.product;

        await Review.findByIdAndDelete(review._id);
        await refreshProductRatingStats(productId);

        res.status(200).json({
            message: 'Review deleted successfully'
        });

    }
    catch(error) {

        res.status(500).json({
            message: error.message
        });
    }
}
