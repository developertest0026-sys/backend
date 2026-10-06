import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String },
    description: { type: String, required: true },
    image: { type: String, required: true },
    isFeatured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Category = mongoose.model('Category', categorySchema);
export default Category;

