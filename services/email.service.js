import nodemailer from 'nodemailer';
import { generateOrderEmailHTML } from '../templates/emailTemplates.js';

// Create SMTP transporter using environment configuration
const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.hostinger.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
};

/**
 * Sends an HTML notification email to customer on order status update
 * @param {Object} order - Full order object from MongoDB
 * @param {String} statusType - 'CONFIRMED' | 'DISPATCHED' | 'SHIPPED' | 'DELIVERED'
 */
export const sendOrderEmail = async (order, statusType = 'CONFIRMED') => {
  try {
    if (!order) return;

    const recipientEmail = order.guestDetails?.email || order.shippingAddress?.email;
    if (!recipientEmail || !recipientEmail.includes('@')) {
      console.log(`[Email Service] No recipient email found for Order ID: ${order.orderNumber || order._id}`);
      return;
    }

    const orderNumber = order.orderNumber || order._id || 'SW-ORD';
    
    let subject = `Order Confirmed (${orderNumber}) - Swariya Fine Jewellery`;
    if (statusType === 'DISPATCHED' || statusType === 'Processing') {
      subject = `Your Order Has Been Dispatched (${orderNumber}) - Swariya Fine Jewellery`;
    } else if (statusType === 'SHIPPED' || statusType === 'Shipped') {
      subject = `Your Order Is In Transit (${orderNumber}) - Swariya Fine Jewellery`;
    } else if (statusType === 'DELIVERED' || statusType === 'Delivered') {
      subject = `Order Delivered Successfully (${orderNumber}) - Swariya Fine Jewellery`;
    }

    const htmlContent = generateOrderEmailHTML(order, statusType);
    const transporter = createTransporter();

    if (!transporter) {
      console.log(`\n==================================================`);
      console.log(`[EMAIL NOTIFICATION LOG] (SMTP User/Pass not set in .env)`);
      console.log(`To: ${recipientEmail}`);
      console.log(`Subject: ${subject}`);
      console.log(`Status Type: ${statusType}`);
      console.log(`Order ID: ${orderNumber}`);
      console.log(`==================================================\n`);
      return;
    }

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'Swariya Fine Jewellery'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to: recipientEmail,
      subject: subject,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Order ${statusType} email sent to ${recipientEmail} | Message ID: ${info.messageId}`);
  } catch (error) {
    console.error(`[Email Service Error] Failed to send ${statusType} email for order:`, error);
  }
};
