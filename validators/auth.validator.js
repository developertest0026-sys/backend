import Joi from "joi";

export const loginValidator = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const registerAdminValidator = Joi.object({
  fullName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("SUPER_ADMIN", "INVENTORY_MANAGER", "ORDER_MANAGER", "CUSTOMER_SUPPORT").default("INVENTORY_MANAGER")
});
