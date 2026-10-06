import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },
    addresses: [
      {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String,
        isDefault: { type: Boolean, default: false }
      }
    ],
    isActive: { type: Boolean, default: true },
    role: { type: String, default: 'customer' }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;
