import Joi from "joi";

export const createProductValidator = Joi.object({
  name: Joi.string().optional().allow("", null),
  title: Joi.string().optional().allow("", null),
  sku: Joi.string().optional().allow("", null),
  description: Joi.string().required().messages({
    'any.required': 'Product description is required',
    'string.empty': 'Product description cannot be empty'
  }),
  category: Joi.string().required().messages({
    'any.required': 'Category is required'
  }),
  subCategory: Joi.string().required().messages({
    'any.required': 'SubCategory is required'
  }),
  material: Joi.string().optional().allow("", null).default("Gold"),
  purity: Joi.string().optional().allow("", null).default("22K"),
  gender: Joi.string().optional().allow("", null).default("Unisex"),
  hallmark: Joi.string().optional().allow("", null),
  grossWeightGrams: Joi.number().optional().allow(null, 0),
  netMetalWeightGrams: Joi.number().optional().allow(null, 0),
  weight: Joi.number().optional().allow(null, 0),
  size: Joi.string().optional().allow("", null),
  price: Joi.number().greater(0).required().messages({
    'any.required': 'Product price is required',
    'number.greater': 'Product price must be greater than 0'
  }),
  discountPrice: Joi.number().min(0).optional().allow(null, 0),
  makingCharges: Joi.number().min(0).optional().allow(null, 0).default(0),
  stock: Joi.number().min(0).required().messages({
    'any.required': 'Stock quantity is required',
    'number.min': 'Stock quantity cannot be negative'
  }),
  stockQuantity: Joi.number().optional(),
  images: Joi.array().items(Joi.string().uri().allow("")).min(1).required().messages({
    'array.min': 'At least 1 product image is required',
    'any.required': 'Product images are required'
  }),
  media: Joi.array().optional(),
  pricing: Joi.object().optional(),
  isTrending: Joi.boolean().optional().default(false),
  isNewArrival: Joi.boolean().optional().default(false),
  isBestseller: Joi.boolean().optional().default(false),
  gemstones: Joi.array().optional(),
  variants: Joi.array().optional()
});
