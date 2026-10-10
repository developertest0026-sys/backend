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
      color,
      careInstructions,
      gemstones,
      makingCharges,
      shippingCharge,
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
      isBestseller,
      hasCashOnDelivery
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
      material: material || "",
      purity: purity || "",
      color: color || "",
      careInstructions: careInstructions || "",
      gemstones: gemstones || [],
      makingCharges: Number(makingCharges || 0),
      shippingCharge: Number(shippingCharge || 0),
      hallmark: hallmark || "",
      gender: gender || "",
      weight: Number(weight || 0),
      size: size || null,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      stock: Number(stock || 0),
      images: images || [],
      variants: variants || [],
      isTrending: isTrending || false,
      isNewArrival: isNewArrival || false,
      isBestseller: isBestseller || false,
      hasCashOnDelivery: hasCashOnDelivery !== undefined ? Boolean(hasCashOnDelivery) : true
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

/**
 * Check Product Code / SKU Availability
 * GET /api/v1/products/check-sku/:sku
 */
export const checkProductSku = async (req, res) => {
  try {
    const { sku } = req.params;
    if (!sku) {
      return res.status(400).json({ success: false, message: "Product SKU Code is required" });
    }

    const cleanSku = sku.trim().toUpperCase();
    const product = await Product.findOne({ sku: cleanSku }).populate("category subCategory").lean();

    if (!product) {
      return res.status(200).json({
        success: true,
        exists: false,
        available: false,
        message: `Product Code "${cleanSku}" is available for creation (Not found in catalog).`,
        product: null
      });
    }

    const isAvailable = product.stock > 0;

    return res.status(200).json({
      success: true,
      exists: true,
      available: isAvailable,
      message: isAvailable 
        ? `Product Code "${cleanSku}" is VALID and IN STOCK (${product.stock} available).` 
        : `Product Code "${cleanSku}" exists but is OUT OF STOCK.`,
      product: {
        id: product._id,
        sku: product.sku,
        name: product.name,
        price: product.price,
        discountPrice: product.discountPrice,
        stock: product.stock,
        isAvailable,
        category: product.category?.name || 'Jewelry',
        subCategory: product.subCategory?.name || '',
        image: product.images?.[0] || '',
        description: product.description || ''
      }
    });
  } catch (error) {
    console.error("Check Product SKU Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};

export const generateSharePreview = async (req, res) => {
  try {
    const { slug } = req.params;
    let query = {};
    if (isValidObjectId(slug)) {
      query._id = slug;
    } else {
      query.$or = [{ slug: slug }, { sku: { $regex: new RegExp(`^${slug}$`, 'i') } }];
    }

    const product = await Product.findOne(query).lean();

    if (!product) {
      return res.status(404).send('Product not found');
    }

    const title = `${product.name} — Sawyria`;
    const description = product.description ? product.description.substring(0, 150) + '...' : `Buy ${product.name} online at Sawyria.`;
    const imageUrl = product.images && product.images.length > 0 ? product.images[0] : 'https://sawyria.com/logo.png';
    const redirectUrl = `https://sawyria.com/product/${slug}`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta property="og:type" content="product">
    <meta property="og:url" content="${redirectUrl}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${redirectUrl}">
    <meta property="twitter:title" content="${title}">
    <meta property="twitter:description" content="${description}">
    <meta property="twitter:image" content="${imageUrl}">
    <script>
        window.location.href = "${redirectUrl}";
    </script>
    <style>
        body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #FAF8F5; }
        .message { text-align: center; color: #59534C; }
    </style>
</head>
<body>
    <div class="message">
        <p>Redirecting to Swariya Jewellers...</p>
        <p>If you are not redirected, <a href="${redirectUrl}">click here</a>.</p>
    </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  } catch (error) {
    console.error("Error generating share preview:", error);
    return res.status(500).send('Internal Server Error');
  }
};
