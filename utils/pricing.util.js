import MetalRate from "../models/metalRate.model.js";

// Standard spot fallback rates (INR per gram)
const FALLBACK_RATES = {
  GOLD_24K: 7250.00,
  GOLD_22K: 6646.00,
  GOLD_18K: 5437.50,
  GOLD_14K: 4226.75,
  SILVER_SILVER_925: 88.50,
  PLATINUM_24K: 3200.00
};

export const calculateProductPrice = async (product) => {
  const metalType = product.metalType;
  const purity = product.metalPurity;
  const netMetalWeightGrams = Number(product.netMetalWeightGrams || 0);
  const gemstonePrice = Number(product.gemstonePrice || 0);

  // 1. Fetch live rate from MongoDB or fallback
  let liveRateRecord = await MetalRate.findOne({ metalType, purity });
  let liveRatePerGram = liveRateRecord ? liveRateRecord.ratePerGram : (FALLBACK_RATES[`${metalType}_${purity}`] || 6500.00);

  // 2. Base Metal Cost
  const metalBasePrice = Number((netMetalWeightGrams * liveRatePerGram).toFixed(2));

  // 3. Making Charges
  let makingChargeAmount = 0;
  if (product.makingChargeType === "PERCENTAGE") {
    makingChargeAmount = Number((metalBasePrice * (Number(product.makingChargeValue || 0) / 100)).toFixed(2));
  } else {
    makingChargeAmount = Number((netMetalWeightGrams * Number(product.makingChargeValue || 0)).toFixed(2));
  }

  // 4. Subtotal & GST
  const subtotal = Number((metalBasePrice + makingChargeAmount + gemstonePrice).toFixed(2));
  const gstPercentage = 3; // 3% GST on Gold Jewelry in India
  const gstAmount = Number((subtotal * (gstPercentage / 100)).toFixed(2));
  const finalPrice = Number((subtotal + gstAmount).toFixed(2));

  return {
    liveRatePerGram,
    metalBasePrice,
    makingChargeAmount,
    gemstonePrice,
    subtotal,
    gstAmount,
    gstPercentage,
    finalPrice
  };
};
