const Joi = require("@hapi/joi");

// Register validation
const registerValidation = (data) => {
  const userShema = Joi.object({
    name: Joi.string().required(),
    username: Joi.string().required().min(6),
    password: Joi.string().required(),
    password2: Joi.ref("password"),
    email: Joi.string().required().email(),
    role: Joi.boolean().default(false)
  });
  return userShema.validate(data);
};
// Login validation
const loginValidation = (data) => {
  const userShema = Joi.object({
    username: Joi.string().required().min(6),
    password: Joi.string().required(),
  });
  return userShema.validate(data);
};

module.exports = {
  registerValidation,
  loginValidation,
};
