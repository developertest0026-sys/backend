import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory' },
    material: { type: String, required: true }, // e.g. Gold, Silver
    purity: { type: String }, // e.g. 18K, 22K
    gemstones: [
      {
        type: { type: String },
        cut: String,
        clarity: String,
        color: String,
        carat: Number
      }
    ],
    makingCharges: { type: Number, default: 0 },
    hallmark: { type: String },
    gender: { type: String, enum: ['Men', 'Women', 'Kids', 'Unisex'], default: 'Unisex' },
    weight: { type: Number },
    size: { type: mongoose.Schema.Types.Mixed }, // String or Number
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    stock: { type: Number, required: true, default: 0 },
    images: [{ type: String }],
    variants: [
      {
        name: String,
        value: String,
        priceDifference: Number
      }
    ],
    isTrending: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isBestseller: { type: Boolean, default: false },
    hasCashOnDelivery: { type: Boolean, default: true },
    hasVerifiedQuality: { type: Boolean, default: true },
    has247Support: { type: Boolean, default: true },
    has1YearWarranty: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);
export default Product;
