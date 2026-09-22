

import Product from "../models/productModel.js";
import Review from "../models/reviewModel.js";
import cloudinary from "../config/cloudinary.js";



export const addProduct = async(req, res)=> {

    try{

        const {name, description, price, discount, stock, category, movement, caseMaterial, strapMaterial, waterResistance, warranty} = req.body;

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
            name, description, price, discount, stock,
            image: {
                url: result.secure_url,
                public_id: result.public_id
            },

            category,

            movement, caseMaterial, strapMaterial, waterResistance, warranty
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



export const getProducts = async(req, res)=> {

    try {

        const {search, category, minPrice, maxPrice, sort} = req.query;

        const filter = {};

        if(search) {
            filter.$or = [
                {
                    name: {
                        $regex: search,
                        $options: 'i'
                    }
                },
                {
                    description: {
                        $regex: search,
                        $options: 'i'
                    }
                }
            ];
        }

        if(category) {
            filter.category = category;
        }

        if(minPrice || maxPrice) {
            filter.price = {};

            if(minPrice) {
                filter.price.$gte = Number(minPrice);
            }

            if(maxPrice) {
                filter.price.$lte = Number(maxPrice);
            }
        }

        let query = Product.find(filter).populate('category');

        switch(sort) {

            case 'price_asc': query = query.sort({price: 1});
            break;

            case 'price_desc': query = query.sort({price: -1});
            break;

            case 'newest': query = query.sort({createdAt: -1});
            break;

            default: query = query.sort({createdAt: -1});
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



export const getProductById = async(req, res)=> {

    try {

        const {id} = req.params;

        const product = await Product.findById(id).populate('category');

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



export const updateProduct = async(req, res)=> {

    try {

        const {id} = req.params;

        const product = await Product.findById(id);

        if(!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        if(req.file) {
            await cloudinary.uploader.destroy(product.image.public_id);

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
            id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        ).populate('category');

        res.status(200).json({
            message: 'Product updated successfully',
            product: updateProduct
        });

    }

    catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
}



export const deleteProduct = async(req, res)=> {

    try {

        const {id} = req.params;
        
        const product = await Product.findById(id);

        if(!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        await Product.findByIdAndDelete(id);

        await Review.deleteMany({
            product: req.params.id
        })

        if(product.image?.public_id) {
            await cloudinary.uploader.destroy(
                product.image.public_id
            );
        }

        res.status(200).json({
            message: 'Product deleted successfully'
        });
    }

    catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
}