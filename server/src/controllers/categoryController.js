import Category from "../models/categoryModel.js";
import cloudinary from "../config/cloudinary.js";


// ADD CATEGORY
export const addCategory = async (req, res) => {
    try {

        console.log("ADD CATEGORY BODY:", req.body);
        console.log("ADD CATEGORY FILE:", req.file);

        const { name, description, image } = req.body || {};

        if (!name) {
            return res.status(400).json({
                message: "Category name is required"
            });
        }

        const existingCategory = await Category.findOne({ name });

        if (existingCategory) {
            return res.status(400).json({
                message: "Category already exists"
            });
        }

        let videoUrl = "";

        // Upload video to Cloudinary if provided
        if (req.file) {

            const result = await cloudinary.uploader.upload(
                `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
                {
                    resource_type: "video",
                    folder: "categories"
                }
            );

            videoUrl = result.secure_url;
        }

        const category = await Category.create({
            name,
            description,
            image,
            video: videoUrl
        });

        res.status(201).json({
            message: "Category created successfully",
            category
        });

    } catch (error) {

        console.error("ADD CATEGORY ERROR:", error);

        res.status(500).json({
            message: error.message
        });
    }
};


// GET ALL CATEGORIES
export const getCategories = async (req, res) => {
    try {

        const categories = await Category.find();

        res.status(200).json({
            categories
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};


// GET SINGLE CATEGORY
export const getCategoryById = async (req, res) => {
    try {

        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        res.status(200).json({
            category
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};


// UPDATE CATEGORY
export const updateCategory = async (req, res) => {
    try {

        console.log("UPDATE CATEGORY BODY:", req.body);
        console.log("UPDATE CATEGORY FILE:", req.file);

        const { name, description, image, status } = req.body || {};

        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        // Upload new video if provided
        if (req.file) {

            const result = await cloudinary.uploader.upload(
                `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
                {
                    resource_type: "video",
                    folder: "categories"
                }
            );

            category.video = result.secure_url;
        }

        // Only update values that were sent
        if (name !== undefined) {
            category.name = name;
        }

        if (description !== undefined) {
            category.description = description;
        }

        if (image !== undefined) {
            category.image = image;
        }

        if (status !== undefined) {
            category.status = status;
        }

        await category.save();

        res.status(200).json({
            message: "Category updated successfully",
            category
        });

    } catch (error) {

        console.error("UPDATE CATEGORY ERROR:", error);

        res.status(500).json({
            message: error.message
        });
    }
};


// DELETE CATEGORY
export const deleteCategory = async (req, res) => {
    try {

        const category = await Category.findByIdAndDelete(
            req.params.id
        );

        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        res.status(200).json({
            message: "Category deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};