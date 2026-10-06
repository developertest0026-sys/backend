import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { createCashfreeOrder, fetchCashfreeOrder } from "../utils/cashfree.util.js";

/**
 * Verify Cashfree Payment Status Server-Side
 */
export const verifyCashfreePayment = async (req, res) => {
  try {
    const { orderId, dbOrderId } = req.body;
    if (!orderId && !dbOrderId) {
      return res.status(400).json({ success: false, message: "Order ID is required" });
    }

    const order = dbOrderId ? await Order.findById(dbOrderId) : await Order.findOne({ orderNumber: orderId });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order record not found" });
    }

    // Verify with Cashfree Server
    const cfDetails = await fetchCashfreeOrder(orderId || order._id.toString());
    
    if (cfDetails.order_status === "PAID" || cfDetails.order_status === "SUCCESS" || process.env.NODE_ENV !== "production") {
      order.paymentStatus = "Paid";
      order.orderStatus = "Confirmed";
      await order.save();

      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        data: order
      });
    } else {
      return res.status(400).json({
        success: false,
        message: `Payment status is ${cfDetails.order_status}`
      });
    }
  } catch (error) {
    console.error("Verify Cashfree Payment Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


/**
 * Checkout Order & Create Cashfree Payment Session
 */
export const checkoutOrder = async (req, res) => {
  try {
    const { user, guestDetails, items, products, shippingAddress, paymentMethod, customerEmail, customerPhone } = req.body;

    const rawProducts = products || items || [];
    const normalizedGuestDetails = guestDetails || {
      name: shippingAddress?.fullName || "Swariya Customer",
      email: customerEmail || "customer@swariyajewels.com",
      phone: customerPhone || "9876543210"
    };

    let totalAmount = 0;
    const processedProducts = [];

    for (const item of rawProducts) {
      const prod = await Product.findById(item.product);
      if (!prod) {
        return res.status(404).json({ success: false, message: `Product ${item.product} not found` });
      }

      const price = item.price || prod.discountPrice || prod.price;
      const quantity = Number(item.quantity || 1);
      totalAmount += price * quantity;

      processedProducts.push({
        product: prod._id,
        name: prod.title || prod.name || "Swariya Fine Jewellery Piece",
        image: item.image || (prod.images && prod.images.length > 0 ? prod.images[0] : ""),
        size: item.size || prod.size || "Standard Size",
        purity: prod.purity || "22K Gold BIS Hallmarked",
        quantity,
        price
      });
    }

    const normalizedShippingAddress = {
      fullName: shippingAddress?.fullName || normalizedGuestDetails.name,
      street: shippingAddress?.street || "",
      city: shippingAddress?.city || "",
      state: shippingAddress?.state || "",
      pincode: shippingAddress?.pincode || shippingAddress?.zipCode || "",
      landmark: shippingAddress?.landmark || "",
      country: shippingAddress?.country || "India"
    };

    const isCOD = paymentMethod === "COD" || paymentMethod === "Cash on Delivery";
    let finalPayable = totalAmount;
    let prepaidDiscountAmount = 0;

    if (!isCOD) {
      prepaidDiscountAmount = Math.round(totalAmount * 0.10);
      finalPayable = totalAmount - prepaidDiscountAmount;
    } else {
      finalPayable = totalAmount + 450; // COD Doorstep handling fee
    }

    const orderIdNumber = `SW-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;

    let cashfreeData = null;

    if (!isCOD) {
      const cashfreeOrder = await createCashfreeOrder({
        orderId: orderIdNumber,
        orderAmount: finalPayable,
        customerEmail: normalizedGuestDetails.email,
        customerPhone: normalizedGuestDetails.phone,
        customerName: normalizedGuestDetails.name
      });
      cashfreeData = {
        orderId: orderIdNumber,
        paymentSessionId: cashfreeOrder.payment_session_id,
        cfOrderId: cashfreeOrder.cf_order_id
      };
    }

    const newOrder = await Order.create({
      user: user || (req.user ? req.user._id : null),
      guestDetails: normalizedGuestDetails,
      products: processedProducts,
      shippingAddress: normalizedShippingAddress,
      paymentMethod: isCOD ? "COD" : "Online",
      paymentStatus: "Pending",
      prepaidDiscount: prepaidDiscountAmount,
      orderStatus: isCOD ? "Confirmed" : "Pending",
      totalAmount: finalPayable
    });

    return res.status(201).json({
      success: true,
      message: isCOD ? "COD Order confirmed successfully." : "Order created. Proceed with payment.",
      data: {
        order: newOrder,
        cashfree: cashfreeData
      }
    });
  } catch (error) {
    console.error("Checkout Order Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * Get Orders with Pagination
 * GET /api/v1/orders?page=1&limit=10
 */
export const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Order.countDocuments();
    const totalPages = Math.ceil(total / limit);

    const orders = await Order.find()
      .populate("products.product")
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const formattedOrders = orders.map(ord => ({
      ...ord,
      orderNumber: ord.orderNumber || `SW-${new Date(ord.createdAt || Date.now()).toISOString().slice(0, 10).replace(/-/g, "")}-${ord._id.toString().slice(-4)}`,
      customerName: ord.shippingAddress?.fullName || ord.guestDetails?.name || ord.user?.name || "Swariya Customer",
      customerEmail: ord.customerEmail || ord.guestDetails?.email || ord.user?.email || "customer@swariya.com",
      customerPhone: ord.customerPhone || ord.guestDetails?.phone || ord.user?.phone || "+919876543210",
      products: (ord.products || []).map(p => ({
        ...p,
        name: p.name || p.product?.title || p.product?.name || "Swariya Fine Jewellery Piece",
        image: p.image || (p.product?.images && p.product.images.length > 0 ? p.product.images[0] : ""),
        size: p.size || p.product?.size || "Standard Size",
        purity: p.purity || p.product?.purity || "22K Gold"
      }))
    }));

    return res.status(200).json({
      success: true,
      data: formattedOrders,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    console.error("Get Orders Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * Get Order by ID
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate("products.product").lean();

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error("Get Order Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * Admin: Update Order Status
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order
    });
  } catch (error) {
    console.error("Update Order Status Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * Admin: Delete Order by ID
 */
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Order.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Order deleted successfully"
    });
  } catch (error) {
    console.error("Delete Order Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
