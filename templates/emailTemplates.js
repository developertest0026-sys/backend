/**
 * Swariya Fine Jewellery - Professional Luxury HTML Email Templates
 * Generates responsive, high-end HTML emails for Order Status changes:
 * 1. CONFIRMED
 * 2. DISPATCHED
 * 3. SHIPPED
 * 4. DELIVERED
 */

export const generateOrderEmailHTML = (order, statusType = 'CONFIRMED') => {
  const orderNumber = order.orderNumber || (order._id ? `#ORD-${order._id.toString().slice(-8).toUpperCase()}` : '#ORD-7F92KLM4');
  const customerName = order.guestDetails?.name || order.shippingAddress?.name || 'Valued Patron';
  const customerPhone = order.guestDetails?.phone || order.shippingAddress?.phone || '';
  const paymentMethod = order.paymentMethod === 'Online' ? 'Prepaid Online' : 'Cash On Delivery (COD)';
  const totalAmount = (order.totalAmount || 0).toLocaleString('en-IN');
  const shippingCharge = order.shippingCharge || 0;

  const address = order.shippingAddress || {};
  const fullAddress = `${address.street || ''}, ${address.city || ''}, ${address.state || ''} - ${address.pincode || ''}`;

  // Status Specific Configuration
  let statusBadge = 'ORDER CONFIRMED';
  let statusColor = '#10B981'; // Emerald Green
  let statusTitle = 'Your Order Is Confirmed!';
  let statusSubtext = 'Thank you for shopping with Swariya Fine Jewellery. Your order has been received and queued for atelier dispatch.';

  if (statusType === 'DISPATCHED' || statusType === 'Processing') {
    statusBadge = 'ATELIER DISPATCHED';
    statusColor = '#D97706'; // Amber
    statusTitle = 'Your Order Has Been Dispatched!';
    statusSubtext = 'Great news! Your jewellery has passed quality check and has been dispatched from our Indore atelier.';
  } else if (statusType === 'SHIPPED' || statusType === 'Shipped') {
    statusBadge = 'IN TRANSIT';
    statusColor = '#2563EB'; // Royal Blue
    statusTitle = 'Your Order Is On Its Way!';
    statusSubtext = 'Your insured shipment is currently in transit with our logistics partner. Doorstep delivery will be completed shortly.';
  } else if (statusType === 'DELIVERED' || statusType === 'Delivered') {
    statusBadge = 'DELIVERED';
    statusColor = '#059669'; // Emerald Deep
    statusTitle = 'Order Delivered Successfully!';
    statusSubtext = 'Your order has been delivered successfully. Thank you for choosing Swariya Fine Jewellery.';
  }

  // Generate Items Table HTML
  const itemsHTML = (order.products || []).map((item) => {
    const prod = item.product || {};
    const name = prod.name || item.name || 'Swariya Fine Jewellery Piece';
    const image = item.selectedImage || item.image || (prod.images && prod.images[0]) || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=300&q=80';
    const color = item.selectedColor || item.color || '';
    let size = item.selectedSize || item.size || '';
    if (size.includes(',')) size = size.split(',')[0].trim();
    const price = ((item.price || prod.price || 0) * (item.quantity || 1)).toLocaleString('en-IN');


    return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #EAE5DE; width: 54px;">
          <img src="${image}" alt="${name}" style="width: 48px; height: 54px; object-fit: cover; border-radius: 8px; border: 1px solid #EAE5DE; display: block;" />
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #EAE5DE; font-family: 'Georgia', serif;">
          <strong style="color: #1C1A18; font-size: 13px; display: block; font-weight: bold;">${name}</strong>
          <span style="font-size: 11px; color: #715B39; font-family: sans-serif; display: inline-block; margin-top: 2px;">
            ${color ? `Color: ${color} &bull; ` : ''}
            ${size ? `Size: ${size} &bull; ` : ''}
            Qty: ${item.quantity || 1}
          </span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #EAE5DE; text-align: right; font-family: monospace; font-weight: bold; color: #1C1A18; font-size: 13px;">
          &#8377;${price}
        </td>
      </tr>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${statusTitle} - Swariya Fine Jewellery</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #FAF8F5; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FAF8F5; padding: 24px 0;">
        <tr>
          <td align="center">
            
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 600px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #EAE5DE; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
              
              <!-- Brand Header with Logo Banner -->
              <tr>
                <td align="center" style="background-color: #1C1A18; padding: 28px 20px; text-align: center; border-bottom: 3px solid #BFA37C;">
                  <table border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center">
                        <img src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=200&q=80" alt="SWARIYA Logo" style="width: 44px; height: 44px; border-radius: 50%; border: 2px solid #BFA37C; display: block; margin-bottom: 8px;" />
                      </td>
                    </tr>
                  </table>
                  <h1 style="margin: 0; color: #FAF8F5; font-family: 'Georgia', 'Times New Roman', serif; font-size: 24px; font-weight: bold; letter-spacing: 3px; text-transform: uppercase;">
                    SWARIYA
                  </h1>
                  <span style="color: #BFA37C; font-size: 9px; text-transform: uppercase; letter-spacing: 4px; display: block; margin-top: 4px; font-weight: bold;">
                    FINE JEWELLERY ATELIER
                  </span>
                </td>
              </tr>

              <!-- Status Notification Banner -->
              <tr>
                <td style="padding: 28px 24px; text-align: center; background-color: #F4EFEB;">
                  <span style="display: inline-block; background-color: ${statusColor}; color: #FFFFFF; font-size: 10px; font-weight: bold; padding: 5px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
                    ${statusBadge}
                  </span>
                  <h2 style="margin: 0 0 8px 0; color: #1C1A18; font-family: 'Georgia', serif; font-size: 22px; font-weight: bold;">
                    ${statusTitle}
                  </h2>
                  <p style="margin: 0; color: #59534C; font-size: 13px; line-height: 1.5; max-width: 480px; margin: 0 auto;">
                    ${statusSubtext}
                  </p>
                </td>
              </tr>

              <!-- Order Reference & Payment Method -->
              <tr>
                <td style="padding: 16px 24px; border-bottom: 1px solid #EAE5DE; background-color: #FFFFFF;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td>
                        <span style="font-size: 9px; color: #8A8278; text-transform: uppercase; font-weight: bold; display: block; letter-spacing: 1px;">UNIQUE ORDER ID</span>
                        <strong style="font-family: monospace; font-size: 15px; color: #1C1A18;">${orderNumber}</strong>
                      </td>
                      <td align="right">
                        <span style="font-size: 9px; color: #8A8278; text-transform: uppercase; font-weight: bold; display: block; letter-spacing: 1px;">PAYMENT METHOD</span>
                        <strong style="font-size: 12px; color: #10B981;">${paymentMethod}</strong>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Customer Greeting & Products Purchased -->
              <tr>
                <td style="padding: 24px;">
                  <p style="margin: 0 0 14px 0; font-size: 14px; color: #1C1A18; line-height: 1.5;">
                    Dear <strong>${customerName}</strong>,
                  </p>
                  <p style="margin: 0 0 18px 0; font-size: 13px; color: #59534C; line-height: 1.5;">
                    Here is the complete summary of your order:
                  </p>

                  <!-- Items Table -->
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px; border: 1px solid #EAE5DE; border-radius: 12px; overflow: hidden;">
                    <tr style="background-color: #F4EFEB;">
                      <th align="left" style="padding: 10px 12px; font-size: 10px; color: #1C1A18; text-transform: uppercase; letter-spacing: 1px;" colspan="2">SELECTED PRODUCT</th>
                      <th align="right" style="padding: 10px 12px; font-size: 10px; color: #1C1A18; text-transform: uppercase; letter-spacing: 1px;">TOTAL</th>
                    </tr>
                    ${itemsHTML}
                  </table>

                  <!-- Totals & Shipping Breakdown -->
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FAF8F5; padding: 16px; border-radius: 12px; border: 1px solid #EAE5DE; margin-bottom: 20px;">
                    <tr>
                      <td style="font-size: 12px; color: #59534C; padding-bottom: 6px;">Shipping Charge</td>
                      <td align="right" style="font-size: 12px; font-weight: bold; color: #10B981; padding-bottom: 6px;">
                        ${shippingCharge > 0 ? `+&#8377;${shippingCharge}` : 'FREE INSURED DELIVERY'}
                      </td>
                    </tr>
                    <tr>
                      <td style="font-size: 14px; font-weight: bold; color: #1C1A18; border-top: 1px solid #EAE5DE; padding-top: 10px;">Total Amount</td>
                      <td align="right" style="font-size: 16px; font-family: monospace; font-weight: bold; color: #1C1A18; border-top: 1px solid #EAE5DE; padding-top: 10px;">
                        &#8377;${totalAmount}
                      </td>
                    </tr>
                  </table>

                  <!-- Delivery Address Box -->
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1px solid #EAE5DE; border-radius: 12px; padding: 16px; background-color: #FFFFFF;">
                    <tr>
                      <td>
                        <strong style="font-size: 10px; text-transform: uppercase; color: #8A8278; letter-spacing: 1px; display: block; margin-bottom: 6px;">
                          INSURED DELIVERY ADDRESS
                        </strong>
                        <p style="margin: 0; font-size: 13px; color: #1C1A18; font-weight: bold;">${customerName} (${customerPhone})</p>
                        <p style="margin: 4px 0 0 0; font-size: 12px; color: #59534C; line-height: 1.4;">${fullAddress}</p>
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>

              <!-- Atelier Support & Concierge Footer -->
              <tr>
                <td style="background-color: #F4EFEB; padding: 22px 24px; text-align: center; border-top: 1px solid #EAE5DE;">
                  <strong style="display: block; font-size: 12px; color: #1C1A18; margin-bottom: 4px;">
                    Have any questions or need assistance with your order?
                  </strong>
                  <p style="margin: 0 0 12px 0; font-size: 11px; color: #59534C;">
                    Our Atelier Concierge team is available 10 AM - 8 PM IST for live phone & WhatsApp support.
                  </p>
                  
                  <table align="center" border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                    <tr>
                      <td style="padding: 0 12px; font-size: 12px; color: #1C1A18; font-weight: bold;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#1C1A18" style="vertical-align: -2px; margin-right: 4px;"><path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1.003 1.003 0 011.02-.24c1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                        <strong>Phone / WhatsApp:</strong> <a href="tel:+919232986593" style="color: #1C1A18; text-decoration: underline;">+91 92329 86593</a>
                      </td>
                      <td style="padding: 0 12px; font-size: 12px; color: #1C1A18; font-weight: bold;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#1C1A18" style="vertical-align: -2px; margin-right: 4px;"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                        <strong>Email Support:</strong> <a href="mailto:contact@sawyria.com" style="color: #1C1A18; text-decoration: underline;">contact@sawyria.com</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Copyright Footer -->
              <tr>
                <td style="background-color: #1C1A18; padding: 18px 20px; text-align: center; font-size: 10px; color: #8A8278;">
                  &copy; 2026 Swariya Fine Jewellery. All Rights Reserved. Atelier Location: Indore, Madhya Pradesh, India.
                </td>
              </tr>

            </table>

          </td>
        </tr>
      </table>

    </body>
    </html>
  `;
};
