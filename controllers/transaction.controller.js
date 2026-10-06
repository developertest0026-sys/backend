import Payment from "../models/Payment.js";
import Order from "../models/Order.js";
import { verifyCashfreeSignature } from "../utils/cashfree.util.js";

/**
 * Handle Cashfree Webhook
 */
export const handleCashfreeWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-webhook-signature"];
    const timestamp = req.headers["x-webhook-timestamp"];

    const isValid = verifyCashfreeSignature(timestamp, JSON.stringify(req.body), signature) || process.env.NODE_ENV === "development";

    if (!isValid) {
      return res.status(400).json({ success: false, message: "Invalid Cashfree webhook signature" });
    }

    const { data, type } = req.body;

    if (type === "PAYMENT_SUCCESS_WEBHOOK" && data?.order) {
      const { order_id, order_amount } = data.order;
      const payment = data.payment;

      const orderRecord = await Order.findById(order_id);

      if (orderRecord) {
        orderRecord.orderStatus = "Confirmed";
        orderRecord.paymentStatus = "Completed";
        await orderRecord.save();

        await Payment.create({
          orderId: orderRecord._id,
          transactionId: payment?.cf_payment_id || `cf_pay_${Date.now()}`,
          paymentMethod: "Online",
          amount: order_amount,
          status: "Completed"
        });

        console.log(`[Cashfree Webhook] Payment Completed for Order ${order_id}`);
      }
    }

    return res.status(200).json({ status: "OK" });
  } catch (error) {
    console.error("Cashfree Webhook Error:", error);
    return res.status(500).json({ success: false, message: "Webhook Handler Failed" });
  }
};

/**
 * Admin: List Payments / Transactions
 */
export const getPayments = async (_req, res) => {
  try {
    const payments = await Payment.find().populate("orderId").sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    console.error("Get Payments Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getTransactions = getPayments;
