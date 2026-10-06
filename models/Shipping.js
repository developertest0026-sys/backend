import mongoose from 'mongoose';

const shippingSchema = new mongoose.Schema(
  {
    stateIsoCode: { type: String, required: true, unique: true },
    stateName: { type: String, required: true },
    isActive: { type: Boolean, default: false },
    cost: { type: Number, default: 0 },
    cityOverrides: [
      {
        cityName: { type: String, required: true },
        isActive: { type: Boolean, default: false },
        cost: { type: Number }
      }
    ]
  },
  { timestamps: true }
);

const Shipping = mongoose.model('Shipping', shippingSchema);
export default Shipping;
