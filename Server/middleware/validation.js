const Joi = require('joi');

const familyCreateSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).optional(),
  motto: Joi.string().max(100).optional(),
  origin: Joi.object({
    country: Joi.string().optional(),
    region: Joi.string().optional(),
    city: Joi.string().optional()
  }).optional()
});

const memberAddSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  dob: Joi.date().max('now').optional(),
  gender: Joi.string().valid('male', 'female', 'other', 'prefer-not-to-say').optional(),
  occupation: Joi.string().max(100).optional(),
  familyId: Joi.string().required(),
  relationships: Joi.object({
    parents: Joi.array().items(Joi.string()).optional(),
    spouses: Joi.array().items(Joi.string()).optional(),
    siblings: Joi.array().items(Joi.string()).optional()
  }).optional(),
  business: Joi.object({
    name: Joi.string().optional(),
    industry: Joi.string().optional(),
    contact: Joi.string().optional()
  }).optional()
});

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

exports.validateFamilyCreate = (req, res, next) => {
  const { error } = familyCreateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

exports.validateMemberAdd = (req, res, next) => {
  const { error } = memberAddSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

exports.validateRegister = (req, res, next) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};