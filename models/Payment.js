import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    transactionId: { type: String },
    paymentMethod: { 
      type: String, 
      required: true, 
      enum: ['COD', 'Card', 'UPI', 'NetBanking', 'Online'] 
    },
    amount: { type: Number, required: true },
    status: { type: String, required: true, enum: ['Pending', 'Completed', 'Failed', 'Refunded'] }
  },
  { timestamps: true }
);

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
