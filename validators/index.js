import { loginValidator, registerAdminValidator } from "./auth.validator.js";
import { categoryValidator } from "./category.validator.js";
import { createProductValidator } from "./product.validator.js";
import { createEnquiryValidator, checkoutOrderValidator } from "./enquiry.validator.js";

export const validators = {
  "/api/v1/auth/login": loginValidator,
  "/api/v1/auth/register-admin": registerAdminValidator,
  "/api/v1/categories": categoryValidator,
  "/api/v1/products": createProductValidator,
  "/api/v1/enquiries": createEnquiryValidator,
  "/api/v1/orders/checkout": checkoutOrderValidator,
  "default": "No validator found for this route."
};
