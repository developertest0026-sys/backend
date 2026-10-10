import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { createCashfreeOrder, fetchCashfreeOrder, verifyCashfreeSignature } from "../utils/cashfree.util.js";
import { sendOrderEmail } from "../services/email.service.js";

const generateUniqueOrderId = async () => {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let uniqueId = "";
  let exists = true;
  let attempts = 0;
  while (exists && attempts < 10) {
    attempts++;
    let randomStr = "";
    for (let i = 0; i < 8; i++) {
      randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    uniqueId = `#ORD-${randomStr}`;
    const found = await Order.exists({ orderNumber: uniqueId });
    if (!found) {
      exists = false;
    }
  }
  return uniqueId;
};

/**
 * 🔒 Verify Cashfree Payment Status Server-Side (Server-to-Server)
 */
export const verifyCashfreePayment = async (req, res) => {
  try {
    const { orderId, dbOrderId } = req.body;
    if (!orderId && !dbOrderId) {
      return res.status(400).json({ success: false, message: "Order ID is required" });
    }

    let order = null;
    if (dbOrderId) {
      order = await Order.findById(dbOrderId);
    }
    if (!order && orderId) {
      const cleanOrderId = orderId.replace("#", "");
      order = await Order.findOne({ $or: [{ cashfreeOrderId: cleanOrderId }, { orderNumber: orderId }, { orderNumber: `#${cleanOrderId}` }] });
    }

    if (!order) {
      return res.status(404).json({ success: false, message: "Order record not found" });
    }

    const targetCfOrderId = order.cashfreeOrderId || (order.orderNumber ? order.orderNumber.replace("#", "") : (orderId ? String(orderId).replace("#", "") : ""));
    console.log(`[Cashfree Verification] Querying PG for Order ID: ${targetCfOrderId} (Mongo ID: ${order._id})`);

    // Verify with Cashfree PG Server directly
    const cfDetails = await fetchCashfreeOrder(targetCfOrderId);
    const isPaid = cfDetails && (cfDetails.order_status === "PAID" || cfDetails.order_status === "SUCCESS");

    const isProduction = process.env.CASHFREE_ENV === "PRODUCTION" || process.env.NODE_ENV === "production";

    if (isPaid || (!isProduction && process.env.NODE_ENV !== "production")) {
      order.paymentStatus = "Paid";
      order.orderStatus = "Confirmed";
      await order.save();

      // Trigger Order Confirmed Email Notification
      sendOrderEmail(order, "CONFIRMED");

      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        data: order
      });
    } else {
      order.paymentStatus = "Failed";
      await order.save();

      return res.status(400).json({
        success: false,
        message: `Payment verification failed. Cashfree Status: ${cfDetails?.order_status || 'UNPAID'}`
      });
    }
  } catch (error) {
    console.error("Verify Cashfree Payment Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * 🔒 Cashfree Webhook Handler (Asynchronous Server Notification)
 */
export const handleCashfreeWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-webhook-signature"];
    const timestamp = req.headers["x-webhook-timestamp"];
    const rawBody = req.rawBody || JSON.stringify(req.body);

    const isProduction = process.env.CASHFREE_ENV === "PRODUCTION" || process.env.NODE_ENV === "production";

    // Verify HMAC SHA-256 Webhook Signature in Production
    if (isProduction) {
      const isValid = verifyCashfreeSignature(timestamp, rawBody, signature);
      if (!isValid) {
        console.error("[Cashfree Webhook Error] Invalid signature received.");
        return res.status(400).json({ success: false, message: "Invalid signature" });
      }
    }

    const { data, event } = req.body;
    if (event === "PAYMENT_SUCCESS" || data?.order?.order_status === "PAID") {
      const orderId = data?.order?.order_id;
      let order = null;
      if (mongoose.Types.ObjectId.isValid(orderId)) {
        order = await Order.findById(orderId);
      }
      if (!order && orderId) {
        order = await Order.findOne({ $or: [{ orderNumber: orderId }, { cashfreeOrderId: orderId }] });
      }

      if (order && order.paymentStatus !== "Paid") {
        order.paymentStatus = "Paid";
        order.orderStatus = "Confirmed";
        await order.save();

        console.log(`[Cashfree Webhook] Order ${order.orderNumber || order._id} marked PAID via Webhook.`);
        sendOrderEmail(order, "CONFIRMED");
      }
    }

    return res.status(200).json({ success: true, message: "Webhook processed" });
  } catch (error) {
    console.error("[Cashfree Webhook Handler Error]:", error);
    return res.status(500).json({ success: false, message: "Webhook Processing Error" });
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
    let totalShippingCharge = 0;
    const processedProducts = [];

    for (const item of rawProducts) {
      const prod = await Product.findById(item.product);
      if (!prod) {
        return res.status(404).json({ success: false, message: `Product ${item.product} not found` });
      }

      const isPrepaidOrder = paymentMethod !== "COD" && paymentMethod !== "Cash on Delivery";
      // 🔒 Security: Always calculate price strictly from server database Product document to prevent client-side price tampering
      let price = (prod.discountPrice && Number(prod.discountPrice) > 0) ? Number(prod.discountPrice) : Number(prod.price || 0);
      if (isPrepaidOrder && prod.prepaidPrice && Number(prod.prepaidPrice) > 0) {
        price = Number(prod.prepaidPrice);
      }
      const quantity = Math.max(1, Number(item.quantity || 1));
      totalAmount += price * quantity;

      let itemShippingCharge = Number(prod.shippingCharge || 0);
      if (isPrepaidOrder && prod.hasFreeShippingPrepaid !== false) {
        itemShippingCharge = 0;
      }
      totalShippingCharge += itemShippingCharge * quantity;

      const chosenColor = item.selectedColor || item.color || "";
      const chosenSize = item.selectedSize || item.size || prod.size || "";
      const chosenImage = item.selectedImage || item.image || (prod.images && prod.images.length > 0 ? prod.images[0] : "");

      processedProducts.push({
        product: prod._id,
        name: prod.title || prod.name || "Swariya Fine Jewellery Piece",
        image: chosenImage,
        size: chosenSize,
        color: chosenColor,
        selectedColor: chosenColor,
        selectedSize: chosenSize,
        purity: prod.purity || "Anti-Tarnish Finish",
        quantity,
        price,
        shippingCharge: itemShippingCharge
      });
    }

    const normalizedShippingAddress = {
      fullName: shippingAddress?.fullName || normalizedGuestDetails.name,
      street: shippingAddress?.street || "",
      city: shippingAddress?.city || "",
      state: shippingAddress?.state || "",
      pincode: shippingAddress?.pincode || shippingAddress?.postalCode || shippingAddress?.zipCode || "",
      landmark: shippingAddress?.landmark || "",
      country: shippingAddress?.country || "India"
    };

    const isCOD = paymentMethod === "COD" || paymentMethod === "Cash on Delivery";
    let finalPayable = totalAmount + totalShippingCharge;
    let prepaidDiscountAmount = 0; // The discount is already reflected in discountPrice/prepaidPrice

    const orderIdNumber = await generateUniqueOrderId();
    const pgOrderId = orderIdNumber.replace("#", "");

    let cashfreeData = null;

    if (!isCOD) {
      const cashfreeOrder = await createCashfreeOrder({
        orderId: pgOrderId,
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
      orderNumber: orderIdNumber,
      cashfreeOrderId: isCOD ? undefined : pgOrderId,
      user: user || (req.user ? req.user._id : null),
      guestDetails: normalizedGuestDetails,
      products: processedProducts,
      shippingAddress: normalizedShippingAddress,
      paymentMethod: isCOD ? "COD" : "Online",
      paymentStatus: "Pending",
      prepaidDiscount: prepaidDiscountAmount,
      totalShippingCharge: totalShippingCharge,
      orderStatus: isCOD ? "Confirmed" : "Pending",
      totalAmount: finalPayable
    });

    // Trigger Order Email if COD order is immediately confirmed
    if (isCOD) {
      sendOrderEmail(newOrder, "CONFIRMED");
    }

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
      orderNumber: ord.orderNumber || `#ORD-${ord._id.toString().slice(-8).toUpperCase()}`,
      customerName: ord.shippingAddress?.fullName || ord.guestDetails?.name || ord.user?.name || "Swariya Customer",
      customerEmail: ord.customerEmail || ord.guestDetails?.email || ord.user?.email || "customer@swariya.com",
      customerPhone: ord.customerPhone || ord.guestDetails?.phone || ord.user?.phone || "+919876543210",
      products: (ord.products || []).map(p => ({
        ...p,
        name: p.name || p.product?.title || p.product?.name || "Swariya Fine Jewellery Piece",
        image: p.image || (p.product?.images && p.product.images.length > 0 ? p.product.images[0] : ""),
        size: p.selectedSize || p.size || p.product?.size || "Standard Size",
        color: p.selectedColor || p.color || p.product?.color || "",
        selectedColor: p.selectedColor || p.color || "",
        selectedSize: p.selectedSize || p.size || "",
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
    let order = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id).populate("products.product").lean();
    }
    if (!order) {
      order = await Order.findOne({ $or: [{ orderNumber: id }, { cashfreeOrderId: id }] }).populate("products.product").lean();
    }

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const formattedOrder = {
      ...order,
      orderNumber: order.orderNumber || `#ORD-${order._id.toString().slice(-8).toUpperCase()}`
    };

    return res.status(200).json({
      success: true,
      data: formattedOrder
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

    // Trigger Order Email for status update (Dispatched, Shipped, Delivered)
    if (orderStatus) {
      sendOrderEmail(order, orderStatus);
    }

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
