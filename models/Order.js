import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    guestDetails: {
      name: String,
      email: String,
      phone: String
    },
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String },
        image: { type: String },
        size: { type: String },
        color: { type: String },
        selectedColor: { type: String },
        selectedSize: { type: String },
        purity: { type: String },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        shippingCharge: { type: Number, default: 0 }
      }
    ],
    shippingAddress: {
      fullName: String,
      street: String,
      city: String,
      state: String,
      pincode: String,
      zipCode: String,
      country: String,
      landmark: String
    },
    shippingModel: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipping' },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed', 'PAID', 'UNPAID', 'Paid'],
      default: 'Pending'
    },
    paymentMethod: { type: String },
    payuTransactionId: { type: String },
    paymentMode: { type: String },
    paymentError: { type: String },
    payuResponse: { type: mongoose.Schema.Types.Mixed },
    prepaidDiscount: { type: Number, default: 0 },
    totalShippingCharge: { type: Number, default: 0 },
    orderStatus: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Dispatched', 'DISPATCHED', 'Shipped', 'SHIPPED', 'Delivered', 'DELIVERED', 'Cancelled'],
      default: 'Pending'
    },
    couponApplied: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
    totalAmount: { type: Number, required: true }
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
