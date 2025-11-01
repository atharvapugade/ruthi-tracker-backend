const Joi = require('joi');

// Register validation schema
exports.registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('Admin', 'Developer', 'User').default('User')
});

// Login validation schema
exports.loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});
