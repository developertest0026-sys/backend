import axios from "axios";
import crypto from "crypto";

const getCashfreeConfig = () => {
  const appId = process.env.CASHFREE_APP_ID || "TEST10000000000000000000";
  const secretKey = process.env.CASHFREE_SECRET_KEY || "TEST_SECRET_KEY_MOCK";
  const env = (process.env.CASHFREE_ENV || "SANDBOX").toUpperCase();
  const isProduction = env === "PRODUCTION" || process.env.NODE_ENV === "production";

  const baseUrl = isProduction
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

  return { appId, secretKey, env, isProduction, baseUrl };
};

/**
 * 🔒 Create Order in Cashfree Payment Gateway (Strict Server-Side Initialization)
 */
export const createCashfreeOrder = async ({ orderId, orderAmount, customerEmail, customerPhone, customerName }) => {
  const { appId, secretKey, isProduction, baseUrl } = getCashfreeConfig();

  const validPhone = (customerPhone && String(customerPhone).replace(/[^0-9]/g, '').length >= 10)
    ? String(customerPhone).replace(/[^0-9]/g, '').slice(-10)
    : "9876543210";

  const validEmail = (customerEmail && customerEmail.includes('@'))
    ? customerEmail
    : "customer@sawyria.com";

  const clientDomain = (process.env.CLIENT_URL || "https://sawyria.com").replace(/^http:\/\//, "https://");
  const returnUrl = `${clientDomain}/order-status?order_id={order_id}`;

  const payload = {
    order_id: String(orderId),
    order_amount: Number(orderAmount),
    order_currency: "INR",
    customer_details: {
      customer_id: `cust_${validPhone}_${Date.now()}`,
      customer_name: customerName || "Swariya Customer",
      customer_email: validEmail,
      customer_phone: validPhone
    },
    order_meta: {
      return_url: returnUrl
    }
  };


  try {
    const response = await axios.post(`${baseUrl}/orders`, payload, {
      headers: {
        "x-api-version": "2023-08-01",
        "x-client-id": appId,
        "x-client-secret": secretKey,
        "Content-Type": "application/json"
      }
    });

    console.log(`[Cashfree Secure PG] Order Created: ${orderId} | Session ID: ${response.data.payment_session_id}`);
    return response.data;
  } catch (apiError) {
    const errDetails = apiError.response?.data || apiError.message;
    console.error("[Cashfree PG API Error]:", errDetails);

    if (isProduction) {
      throw new Error(`Cashfree Secure PG Error: ${JSON.stringify(errDetails)}`);
    }

    // Sandbox / Development fallback simulated session (ONLY IN NON-PRODUCTION ENVIRONMENT)
    console.warn("[Cashfree Sandbox] Using local test payment session for development testing.");
    return {
      cf_order_id: `cf_${Date.now()}`,
      order_id: orderId,
      payment_session_id: `session_cf_mock_${Date.now()}`,
      order_status: "ACTIVE",
      order_amount: orderAmount,
      order_currency: "INR"
    };
  }
};

/**
 * 🔒 Fetch & Verify Order Status directly from Cashfree PG Server (Server-to-Server)
 */
export const fetchCashfreeOrder = async (orderId) => {
  const { appId, secretKey, isProduction, baseUrl } = getCashfreeConfig();

  try {
    const response = await axios.get(`${baseUrl}/orders/${orderId}`, {
      headers: {
        "x-api-version": "2023-08-01",
        "x-client-id": appId,
        "x-client-secret": secretKey,
        "Content-Type": "application/json"
      }
    });

    return response.data;
  } catch (error) {
    const errDetails = error.response?.data || error.message;
    console.error(`[Cashfree Fetch Error for Order ${orderId}]:`, errDetails);

    if (isProduction) {
      return {
        order_id: orderId,
        order_status: "FAILED",
        error: "Failed to verify transaction status with Cashfree servers."
      };
    }

    // In sandbox dev testing when using mock credentials
    return {
      order_id: orderId,
      order_status: "PAID",
      order_amount: 0,
      order_currency: "INR"
    };
  }
};

/**
 * 🔒 Verify Cashfree HMAC SHA-256 Webhook Signature (Anti-Tampering Protection)
 */
export const verifyCashfreeSignature = (timestamp, rawBody, signature) => {
  const { secretKey } = getCashfreeConfig();
  if (!signature || !timestamp) return false;

  try {
    const data = timestamp + rawBody;
    const expectedSignature = crypto
      .createHmac("sha256", secretKey)
      .update(data)
      .digest("base64");

    return crypto.timingSafeEqual(
      Buffer.from(signature, "base64"),
      Buffer.from(expectedSignature, "base64")
    );
  } catch (err) {
    console.error("[Cashfree Webhook Signature Verification Error]:", err);
    return false;
  }
};


