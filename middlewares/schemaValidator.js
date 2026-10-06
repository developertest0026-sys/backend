import _ from "lodash";
import Joi from "joi";
import { validators } from "../validators/index.js";

const validationMiddleware = (useJoiError = true) => {
  const _useJoiError = _.isBoolean(useJoiError) && useJoiError;
  const _supportedMethods = ["post", "put", "patch"];
  const _validationOptions = {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true
  };

  return (req, res, next) => {
    const route = req.route ? req.route.path : req.path;
    const fullRoute = req.baseUrl ? `${req.baseUrl}${route}` : route;
    const method = req.method.toLowerCase();

    const targetValidator = validators[fullRoute] || validators[route];

    if (_supportedMethods.includes(method) && targetValidator) {
      const dataToValidate = _.isEmpty(req.body) ? req.query : req.body;
      const { error, value } = targetValidator.validate(dataToValidate, _validationOptions);

      if (error) {
        const JoiError = {
          success: false,
          message: error.details[0].message.replace(/['"]/g, "")
        };
        const CustomError = {
          status: "failed",
          message: "Invalid request data. Please review request payload and try again."
        };

        return res.status(400).json(_useJoiError ? JoiError : CustomError);
      } else {
        req.body = value;
        return next();
      }
    }
    next();
  };
};

export default validationMiddleware;
