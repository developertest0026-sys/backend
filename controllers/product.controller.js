import mongoose from "mongoose";
import Product from "../models/Product.js";
import SubCategory from "../models/SubCategory.js";

const isValidObjectId = (val) => mongoose.Types.ObjectId.isValid(val);

/**
 * Get Products with Pagination & Filtering
 * GET /api/v1/products?page=1&limit=10&category=...&search=...
 */
export const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { category, subCategory, material, purity, gender, search } = req.query;
    let query = {};

    if (category && isValidObjectId(category)) query.category = category;
    if (subCategory && isValidObjectId(subCategory)) query.subCategory = subCategory;
    if (material) query.material = material;
    if (purity) query.purity = purity;
    if (gender) query.gender = gender;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } }
      ];
    }

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    const products = await Product.find(query)
      .populate("category", "name")
      .populate("subCategory", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total: totalProducts,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    console.error("Get Products Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};

/**
 * Get Product Details by ID
 * GET /api/v1/products/:id
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate("category subCategory").lean();

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error("Get Product By ID Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};

/**
 * Create Jewelry Product
 * POST /api/v1/products
 */
export const createProduct = async (req, res) => {
  try {
    const {
      sku,
      name,
      description,
      category,
      subCategory,
      material,
      purity,
      gemstones,
      makingCharges,
      hallmark,
      gender,
      weight,
      size,
      price,
      discountPrice,
      stock,
      images,
      variants,
      isTrending,
      isNewArrival,
      isBestseller
    } = req.body;

    const existing = await Product.findOne({ sku: sku.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: "Product with this SKU already exists" });
    }

    // Resolve subCategory if passed as string name or ID
    let validSubCategory = null;
    if (subCategory && isValidObjectId(subCategory)) {
      validSubCategory = subCategory;
    } else if (subCategory && typeof subCategory === "string") {
      const subObj = await SubCategory.findOne({ name: subCategory });
      if (subObj) validSubCategory = subObj._id;
    }

    const validCategory = category && isValidObjectId(category) ? category : null;

    const newProduct = await Product.create({
      sku: sku.toUpperCase(),
      name,
      description,
      category: validCategory,
      subCategory: validSubCategory,
      material,
      purity,
      gemstones: gemstones || [],
      makingCharges: Number(makingCharges || 0),
      hallmark: hallmark || "",
      gender: gender || "Unisex",
      weight: Number(weight || 0),
      size: size || null,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      stock: Number(stock || 0),
      images: images || [],
      variants: variants || [],
      isTrending: isTrending || false,
      isNewArrival: isNewArrival || false,
      isBestseller: isBestseller || false
    });

    return res.status(201).json({
      success: true,
      message: "Jewelry product created successfully",
      data: newProduct
    });
  } catch (error) {
    console.error("Create Product Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};

/**
 * Update Product by ID
 * PUT /api/v1/products/:id
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.sku) {
      updateData.sku = updateData.sku.toUpperCase();
    }

    if (updateData.category && !isValidObjectId(updateData.category)) {
      delete updateData.category;
    }

    if (updateData.subCategory && isValidObjectId(updateData.subCategory)) {
      // Valid ID
    } else if (updateData.subCategory && typeof updateData.subCategory === "string") {
      const subObj = await SubCategory.findOne({ name: updateData.subCategory });
      updateData.subCategory = subObj ? subObj._id : null;
    } else {
      updateData.subCategory = null;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct
    });
  } catch (error) {
    console.error("Update Product Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * Delete Product by ID
 * DELETE /api/v1/products/:id
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    console.error("Delete Product Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
