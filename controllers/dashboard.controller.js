import Order from "../models/Order.js";
import Product from "../models/Product.js";
import CustomerEnquiry from "../models/CustomerEnquiry.js";

/**
 * Admin Dashboard Overview Metrics
 * GET /api/v1/dashboard/stats
 */
export const getDashboardStats = async (_req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const activeInquiries = await CustomerEnquiry.countDocuments({ status: { $ne: "CLOSED" } });
    const lowStockProducts = await Product.countDocuments({ stock: { $lt: 3 } });

    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: { $in: ["Completed", "PAID"] } } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
    ]);

    const totalRevenueAmount = revenueResult[0]?.totalRevenue || 0;

    const recentOrders = await Order.find()
      .populate("products.product")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const formattedRecentOrders = recentOrders.map(ord => ({
      ...ord,
      orderNumber: ord.orderNumber || `#ORD-${ord._id.toString().slice(-8).toUpperCase()}`,
      customerEmail: ord.customerEmail || ord.guestDetails?.email || ord.user?.email || "customer@swariya.com"
    }));

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalRevenue: totalRevenueAmount,
          totalRevenueFormatted: `₹ ${totalRevenueAmount.toLocaleString("en-IN")}`,
          totalOrders,
          activeInquiries,
          totalProducts,
          lowStockProducts
        },
        recentOrders: formattedRecentOrders
      }
    });
  } catch (error) {
    console.error("Get Dashboard Stats Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
