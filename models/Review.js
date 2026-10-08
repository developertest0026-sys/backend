import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewerName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    images: [{ type: String }],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    isApproved: { type: Boolean, default: false },
    isHomeFeatured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Keep isApproved synced with status
reviewSchema.pre('save', function (next) {
  this.isApproved = this.status === 'approved';
  next();
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
