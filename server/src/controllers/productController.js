

import Product from "../models/productModel.js";
import Review from "../models/reviewModel.js";
import cloudinary from "../config/cloudinary.js";


// ADD PRODUCT //
export const addProduct = async(req, res,)=> {

    try {
        console.log("BODY:", req.body);
        console.log("FILE:", req.file);

        const {name, description, price, discount, stock, image, category} = req.body;

        if(!name || !description || !price || !stock || !category) {
            return res.status(400).json({
                message: 'Required fields are missing'
            });
        }

        if(!req.file) {
            return res.status(400).json({
                message: 'Image is required'
            });
        }

        const result = await cloudinary.uploader.upload(
                `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
                {
                    folder: 'products'
                }
            );

        const product = await Product.create({
            name,
            description,
            price,
            discount,
            stock,
            image: {
                url: result.secure_url,
                public_id: result.public_id
            },
            category
        });

        res.status(201).json({
            message: 'Product created successfully',
            product
        });

    }
    catch(error) {

        res.status(500).json({
            message: error.message
        });
    }
}




// GET PRODUCT //
export const getProducts = async(req, res)=> {

    try {

        const { search, category, minPrice, maxPrice, sort } = req.query;

        const filter = {};

        // text search across name + description
        if(search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // filter by category id
        if(category) {
            filter.category = category;
        }

        // price range
        if(minPrice || maxPrice) {
            filter.price = {};

            if(minPrice) filter.price.$gte = Number(minPrice);
            if(maxPrice) filter.price.$lte = Number(maxPrice);
        }

        let query = Product.find(filter).populate('category');

        // sorting
        switch(sort) {
            case 'price_asc':
                query = query.sort({ price: 1 });
                break;

            case 'price_desc':
                query = query.sort({ price: -1 });
                break;

            case 'newest':
                query = query.sort({ createdAt: -1 });
                break;

            default:
                query = query.sort({ createdAt: -1 });
        }

        const products = await query;

        res.status(200).json({
            products
        });

    }
    catch(error) {

        res.status(500).json({
            message: error.message
        });
    }
}




// GET SINGLE PRODUCT //
export const getProductById = async(req, res)=> {

    try {

        const product = await Product.findById(req.params.id)
        .populate('category');

        if(!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        res.status(200).json({
            product
        });

    }
    catch(error) {

        res.status(500).json({
            message: error.message
        });
    }
}




// UPDATE PRODUCT //
export const updateProduct = async(req, res)=> {

    try {

        const product = await Product.findById(req.params.id);

        if(!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        if(req.file) {

            await cloudinary.uploader.destroy(
                product.image.public_id
            );

            const result = await cloudinary.uploader.upload(
                `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
                {
                    folder: 'products'
                }
            );

            req.body.image = {
                url: result.secure_url,
                public_id: result.public_id
            };
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id, req.body,
            {
                new: true,
                runValidators: true
            }
        ).populate('category');

        res.status(200).json({
            message: 'Product updated successfully',
            product: updatedProduct
        });

    }
    catch(error) {

        res.status(500).json({
            message: error.message
        });
    }
}




// DELETE PRODUCT //
export const deleteProduct = async(req, res)=> {

    try {
        
        const product = await Product.findById(req.params.id);

        if(!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }
        
        await Product.findByIdAndDelete(req.params.id);

        // clean up dependent data so nothing orphaned is left behind
        await Review.deleteMany({ product: req.params.id });

        if(product.image?.public_id) {
            await cloudinary.uploader.destroy(product.image.public_id);
        }

        res.status(200).json({
            message: 'Product delete successfully'
        });

    }
    catch(error) {

        res.status(500).json({
            message: error.message
        });
    }
}