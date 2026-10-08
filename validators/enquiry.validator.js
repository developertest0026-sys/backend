import Joi from "joi";

export const createEnquiryValidator = Joi.object({
  name: Joi.string().optional().allow("", null),
  customerName: Joi.string().optional().allow("", null),
  email: Joi.string().email().optional().allow("", null),
  phone: Joi.string().required(),
  enquiryType: Joi.string().valid("PRODUCT_INQUIRY", "BESPOKE_DESIGN", "APPOINTMENT", "BULK_ORDER", "SEND_QUERY", "CONTACT_US").default("BESPOKE_DESIGN"),
  product: Joi.string().allow(null, ""),
  status: Joi.string().valid("NEW", "IN_REVIEW", "CLOSED").optional().default("NEW"),
  message: Joi.string().required(),
  referenceImageUrl: Joi.string().allow(null, "")
});

export const checkoutOrderValidator = Joi.object({
  user: Joi.string().optional().allow(null, ""),
  guestDetails: Joi.object({
    name: Joi.string().optional().allow("", null),
    email: Joi.string().optional().allow("", null),
    phone: Joi.string().optional().allow("", null)
  }).optional(),
  customerEmail: Joi.string().optional().allow("", null),
  customerPhone: Joi.string().optional().allow("", null),
  shippingAddress: Joi.object({
    fullName: Joi.string().optional().allow("", null),
    street: Joi.string().optional().allow("", null),
    city: Joi.string().optional().allow("", null),
    state: Joi.string().optional().allow("", null),
    pincode: Joi.string().optional().allow("", null),
    postalCode: Joi.string().optional().allow("", null),
    zipCode: Joi.string().optional().allow("", null),
    landmark: Joi.string().optional().allow("", null),
    country: Joi.string().default("India")
  }).required(),
  products: Joi.array().items(
    Joi.object({
      product: Joi.string().required(),
      quantity: Joi.number().min(1).default(1),
      price: Joi.number().optional(),
      size: Joi.string().optional().allow("", null),
      color: Joi.string().optional().allow("", null),
      selectedSize: Joi.string().optional().allow("", null),
      selectedColor: Joi.string().optional().allow("", null),
      image: Joi.string().optional().allow("", null),
      selectedImage: Joi.string().optional().allow("", null),
      shippingCharge: Joi.number().optional(),
      purity: Joi.string().optional().allow("", null),
      name: Joi.string().optional().allow("", null)
    })
  ).optional(),
  items: Joi.array().items(
    Joi.object({
      product: Joi.string().required(),
      quantity: Joi.number().min(1).default(1),
      price: Joi.number().optional(),
      size: Joi.string().optional().allow("", null),
      color: Joi.string().optional().allow("", null),
      selectedSize: Joi.string().optional().allow("", null),
      selectedColor: Joi.string().optional().allow("", null),
      image: Joi.string().optional().allow("", null),
      selectedImage: Joi.string().optional().allow("", null),
      shippingCharge: Joi.number().optional(),
      purity: Joi.string().optional().allow("", null),
      name: Joi.string().optional().allow("", null)
    })
  ).optional(),
  paymentMethod: Joi.string().optional().default("Online")
});

