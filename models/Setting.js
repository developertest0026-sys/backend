import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    globalFreeShippingThreshold: { type: Number, default: 0 },
    marqueeText: { type: String, default: 'Welcome to Swariya Jewellers! ✦ Flat 10% OFF on Prepaid Orders ✦ Free Insured Shipping Across India' },
    isMarqueeActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const Setting = mongoose.model('Setting', settingSchema);
export default Setting;
