import Joi from "joi";

export const categoryValidator = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'Category name is required'
  }),
  slug: Joi.string().optional().allow("", null),
  description: Joi.string().optional().allow("", null),
  image: Joi.string().uri().required().messages({
    'any.required': 'Category image is required',
    'string.uri': 'Category image must be a valid URL'
  }),
  isFeatured: Joi.boolean().optional().default(false),
  subcategories: Joi.array().items(Joi.string()).optional()
});
