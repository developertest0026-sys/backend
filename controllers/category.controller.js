import Category from "../models/Category.js";
import SubCategory from "../models/SubCategory.js";

/**
 * Get Categories with SubCategories
 */
export const getCategories = async (_req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 }).lean();
    const subCategories = await SubCategory.find().populate("category", "name").sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: {
        categories,
        subCategories
      }
    });
  } catch (error) {
    console.error("Get Categories Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * Create Category
 */
export const createCategory = async (req, res) => {
  try {
    const { name, slug, description, image, isFeatured } = req.body;
    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: "Category already exists" });
    }

    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const category = await Category.create({ 
      name, 
      slug: generatedSlug,
      description: description || name,
      image: image || "", 
      isFeatured: isFeatured || false 
    });

    return res.status(201).json({ success: true, message: "Category created successfully", data: category });
  } catch (error) {
    console.error("Create Category Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};

/**
 * Update Category
 */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Category.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Category not found" });
    return res.status(200).json({ success: true, message: "Category updated", data: updated });
  } catch (error) {
    console.error("Update Category Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};

/**
 * Delete Category
 */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: "Category not found" });
    return res.status(200).json({ success: true, message: "Category deleted" });
  } catch (error) {
    console.error("Delete Category Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};

/**
 * Create SubCategory
 */
export const createSubCategory = async (req, res) => {
  try {
    const { name, image, category } = req.body;
    const subCategory = await SubCategory.create({ name, image: image || "", category });
    return res.status(201).json({ success: true, message: "SubCategory created", data: subCategory });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * Delete SubCategory
 */
export const deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await SubCategory.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: "SubCategory not found" });
    return res.status(200).json({ success: true, message: "SubCategory deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
