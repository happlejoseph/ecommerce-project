

import Category from "../models/categoryModel.js";




// ADD CATEGORY //
export const addCategory = async(req, res)=> {

    try {

        const {name, description, image} = req.body;

        if(!name) {
            return res.status(400).json({
                message: 'Category name is required'
            });
        }

        const existingCategory = await Category.findOne({name});

        if(existingCategory) {
            return res.status(400).json({
                message: 'Category already exists'
            });
        }

        const category = await Category.create({
            name, description, image
        })

        res.status(201).json({
            message: 'Category created successfully',
            category
        })

    }
    catch(error) {

        res.status(500).json({
            message: error.message
        });
    }
}




// GET ALL CATEGORIES //
export const getCategories = async(req, res)=> {

    try {

        const categories = await Category.find();

        res.status(200).json({
            categories
        });

    }
    catch(error) {

        res.status(500).json({
            message: error.message
        });
    }
}




// GET SINGLE CATEGORY //
export const getCategoryById = async(req, res)=> {

    try {

        const category = await Category.findById(req.params.id);

        if(!category) {
            return res.status(404).json({
                message: 'Category not found'
            });
        }

        res.status(200).json({
            category
        });

    }
    catch(error) {

        res.status(500).json({
            message: error.message
        });
    }
}




// UPDATE CATEGORY //
export const updateCategory = async(req, res)=> {

    try {

        const {name, description, image, status} = req.body;

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            {
                name, description, image, status
            },
            {
                new: true
            }
        );

        if(!category) {
            return res.status(404).json({
                message: 'Category not found'
            });
        }

        res.status(200).json({
            message: 'Category updated successfully',
            category
        });

    }
    catch(error) {

        res.status(500).json({
            message: error.message
        });
    }
}



// DELETE CATEGORY //
export const deleteCategory = async(req, res)=> {

    try {

        const category = await Category.findByIdAndDelete(
            req.params.id
        );

        if(!category) {
            return res.status(404).json({
                message: 'Category not found'
            });
        }

        res.status(200).json({
            message: 'Category deleted successfully'
        });

    }
    catch(error) {

        res.status(500).json({
            message: error.message
        });
    }
}