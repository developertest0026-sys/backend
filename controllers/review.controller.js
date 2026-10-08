import mongoose from "mongoose";
import Review from "../models/Review.js";
import Product from "../models/Product.js";

const findProductByAnyId = async (productId) => {
  if (!productId) return null;
  const decoded = decodeURIComponent(String(productId)).trim();

  // 1. Try ObjectId lookup
  if (mongoose.Types.ObjectId.isValid(decoded)) {
    const found = await Product.findById(decoded);
    if (found) return found;
  }

  // 2. Extract alphanumeric words
  const words = decoded.match(/[a-zA-Z0-9]+/g) || [];
  if (words.length > 0) {
    const wordRegexStr = '^' + words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[\\s\\-_]*') + '$';
    const nameRegex = new RegExp(wordRegexStr, 'i');

    const found = await Product.findOne({
      $or: [
        { sku: { $regex: '^' + decoded + '$', $options: 'i' } },
        { slug: { $regex: '^' + decoded + '$', $options: 'i' } },
        { name: nameRegex }
      ]
    });
    if (found) return found;
  }

  // 3. Fallback direct findOne
  return await Product.findOne({
    $or: [
      { sku: { $regex: decoded, $options: 'i' } },
      { name: { $regex: decoded, $options: 'i' } }
    ]
  });
};

/**
 * Get Approved Reviews for a Product (Public)
 * GET /api/v1/reviews/product/:productId
 */
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const targetProduct = await findProductByAnyId(productId);
    const rawId = targetProduct ? targetProduct._id : (mongoose.Types.ObjectId.isValid(productId) ? productId : null);

    if (!rawId) {
      return res.status(200).json({
        success: true,
        data: [],
        summary: { totalReviews: 0, avgRating: 5.0, ratingCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } }
      });
    }

    const objectIdInstance = new mongoose.Types.ObjectId(rawId);
    const idString = String(rawId);

    const reviews = await Review.find({
      $or: [
        { product: objectIdInstance },
        { product: idString }
      ],
      $and: [
        { status: { $ne: "rejected" } },
        { $or: [{ status: "approved" }, { isApproved: true }] }
      ]
    }).sort({ createdAt: -1 }).lean();

    // Calculate rating summary
    const totalReviews = reviews.length;
    let avgRating = 5.0;
    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    if (totalReviews > 0) {
      const sum = reviews.reduce((acc, r) => {
        const rounded = Math.round(r.rating) || 5;
        if (ratingCounts[rounded] !== undefined) ratingCounts[rounded]++;
        return acc + r.rating;
      }, 0);
      avgRating = Number((sum / totalReviews).toFixed(1));
    }

    return res.status(200).json({
      success: true,
      data: reviews,
      summary: {
        totalReviews,
        avgRating,
        ratingCounts
      }
    });
  } catch (error) {
    console.error("Get Product Reviews Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch product reviews" });
  }
};

/**
 * Submit a Customer Review (Public - Pending Approval)
 * POST /api/v1/reviews
 */
export const createCustomerReview = async (req, res) => {
  try {
    const { productId, reviewerName, rating, comment, images } = req.body;

    if (!productId || !reviewerName || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields: Name, Rating, and Review comment."
      });
    }

    const targetProduct = await findProductByAnyId(productId);
    const rawId = targetProduct ? targetProduct._id : (mongoose.Types.ObjectId.isValid(productId) ? productId : null);

    if (!rawId) {
      return res.status(400).json({
        success: false,
        message: "Product not found. Please select a valid product to review."
      });
    }

    const actualObjectId = new mongoose.Types.ObjectId(rawId);

    const review = await Review.create({
      product: actualObjectId,
      reviewerName: reviewerName.trim(),
      rating: Number(rating),
      comment: comment.trim(),
      images: Array.isArray(images) ? images.filter(Boolean) : (images ? [images] : []),
      status: "pending",
      isApproved: false
    });

    return res.status(201).json({
      success: true,
      data: review,
      message: "Thank you! Your review has been submitted successfully and will be published after admin approval."
    });
  } catch (error) {
    console.error("Create Customer Review Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to submit review" });
  }
};

/**
 * Get All Reviews for Admin Panel with Filtering
 * GET /api/v1/reviews/admin/all?status=...&search=...
 */
export const getAllReviewsAdmin = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { reviewerName: { $regex: search, $options: "i" } },
        { comment: { $regex: search, $options: "i" } }
      ];
    }

    const reviews = await Review.find(query)
      .populate("product", "name sku images price")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error("Get All Admin Reviews Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch admin reviews" });
  }
};

/**
 * Update Review Status (Approve / Reject) (Admin)
 * PATCH /api/v1/reviews/admin/:id/status
 */
export const updateReviewStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    review.status = status;
    review.isApproved = status === 'approved';
    await review.save();

    // Recalculate product rating summary on approval/rejection
    if (review.product) {
      const approvedReviews = await Review.find({ product: review.product, status: 'approved' });
      const count = approvedReviews.length;
      const avg = count > 0 ? Number((approvedReviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1)) : 4.9;

      await Product.findByIdAndUpdate(review.product, {
        rating: avg,
        reviewsCount: count
      });
    }

    return res.status(200).json({
      success: true,
      data: review,
      message: `Review status updated to ${status}`
    });
  } catch (error) {
    console.error("Update Review Status Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to update review status" });
  }
};

/**
 * Create Admin Approved Review Directly (Admin)
 * POST /api/v1/reviews/admin/add
 */
export const createAdminReview = async (req, res) => {
  try {
    const { productId, reviewerName, rating, comment, images } = req.body;

    if (!productId || !reviewerName || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields: Product, Reviewer Name, Rating, and Comment."
      });
    }

    const review = await Review.create({
      product: productId,
      reviewerName: reviewerName.trim(),
      rating: Number(rating),
      comment: comment.trim(),
      images: Array.isArray(images) ? images.filter(Boolean) : (images ? [images] : []),
      status: "approved",
      isApproved: true
    });

    // Recalculate product rating summary
    const approvedReviews = await Review.find({ product: productId, status: 'approved' });
    const count = approvedReviews.length;
    const avg = count > 0 ? Number((approvedReviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1)) : 4.9;

    await Product.findByIdAndUpdate(productId, {
      rating: avg,
      reviewsCount: count
    });

    return res.status(201).json({
      success: true,
      data: review,
      message: "Admin review added and approved successfully!"
    });
  } catch (error) {
    console.error("Create Admin Review Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to create admin review" });
  }
};

/**
 * Delete Review (Admin)
 * DELETE /api/v1/reviews/admin/:id
 */
export const deleteReviewAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    if (review.product) {
      const approvedReviews = await Review.find({ product: review.product, status: 'approved' });
      const count = approvedReviews.length;
      const avg = count > 0 ? Number((approvedReviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1)) : 4.9;

      await Product.findByIdAndUpdate(review.product, {
        rating: avg,
        reviewsCount: count
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully"
    });
  } catch (error) {
    console.error("Delete Review Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to delete review" });
  }
};

/**
 * Get Featured Reviews for Home Page (Public - Limit 8)
 * GET /api/v1/reviews/featured-home
 */
export const getHomeFeaturedReviews = async (req, res) => {
  try {
    let reviews = await Review.find({
      status: "approved",
      isHomeFeatured: true
    })
      .populate("product", "name sku images price")
      .sort({ updatedAt: -1 })
      .limit(8)
      .lean();

    if (!reviews || reviews.length === 0) {
      const fallback = await Review.find({ status: "approved" })
        .populate("product", "name sku images price")
        .sort({ createdAt: -1 })
        .limit(8)
        .lean();
      reviews = fallback;
    }

    return res.status(200).json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error("Get Home Featured Reviews Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch home reviews" });
  }
};

/**
 * Toggle Home Page Featured Status for a Review (Admin)
 * PATCH /api/v1/reviews/admin/:id/toggle-home
 */
export const toggleHomeFeaturedAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    review.isHomeFeatured = !review.isHomeFeatured;
    await review.save();

    return res.status(200).json({
      success: true,
      data: review,
      message: `Home featured status toggled to ${review.isHomeFeatured}`
    });
  } catch (error) {
    console.error("Toggle Home Featured Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to toggle home featured status" });
  }
};
