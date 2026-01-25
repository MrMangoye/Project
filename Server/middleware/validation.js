const Joi = require('joi');

const familyCreateSchema = Joi.object({
  name: Joi.string().min(2).max(100).required()
    .messages({
      'string.empty': 'Family name is required',
      'string.min': 'Family name must be at least 2 characters',
      'string.max': 'Family name must be less than 100 characters',
      'any.required': 'Family name is required'
    }),
  description: Joi.string().max(500).optional(),
  motto: Joi.string().max(100).optional(),
  origin: Joi.object({
    country: Joi.string().optional(),
    region: Joi.string().optional(),
    city: Joi.string().optional()
  }).optional()
});

// UPDATED AND COMPLETE memberAddSchema
const memberAddSchema = Joi.object({
  name: Joi.string().min(2).max(100).required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name must be less than 100 characters',
      'any.required': 'Name is required'
    }),
  dob: Joi.date().max('now').optional()
    .messages({
      'date.base': 'Date of birth must be a valid date',
      'date.max': 'Date of birth cannot be in the future'
    }),
  gender: Joi.string().valid('male', 'female', 'other', 'prefer-not-to-say').optional()
    .messages({
      'any.only': 'Gender must be male, female, other, or prefer-not-to-say'
    }),
  occupation: Joi.string().max(100).optional(),
  bio: Joi.string().max(1000).optional(),
  familyId: Joi.string().required()
    .messages({
      'string.empty': 'Family ID is required',
      'any.required': 'Family ID is required'
    }),
  relationships: Joi.object({
    parents: Joi.array().items(Joi.string()).optional(),
    spouses: Joi.array().items(Joi.string()).optional(),
    siblings: Joi.array().items(Joi.string()).optional(),
    children: Joi.array().items(Joi.string()).optional()
  }).optional(),
  business: Joi.object({
    name: Joi.string().optional(),
    industry: Joi.string().optional(),
    contact: Joi.string().optional()
  }).optional(),
  contactInfo: Joi.object({
    email: Joi.string().email().optional()
      .messages({
        'string.email': 'Email must be a valid email address'
      }),
    phone: Joi.string().optional(),
    address: Joi.string().optional()
  }).optional(),
  education: Joi.array().items(Joi.object({
    institution: Joi.string().optional(),
    degree: Joi.string().optional(),
    year: Joi.number().integer().min(1900).max(new Date().getFullYear()).optional()
  })).optional(),
  achievements: Joi.array().items(Joi.object({
    title: Joi.string().optional(),
    year: Joi.number().integer().min(1900).max(new Date().getFullYear()).optional(),
    description: Joi.string().optional()
  })).optional()
}).options({ abortEarly: false, allowUnknown: true });

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters',
      'any.required': 'Name is required'
    }),
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string().min(6).required()
    .messages({
      'string.min': 'Password must be at least 6 characters',
      'any.required': 'Password is required'
    })
});

// TEST VALIDATION SCHEMA (for debugging)
const testMemberAddSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  familyId: Joi.string().required()
});

exports.validateFamilyCreate = (req, res, next) => {
  console.log('🔍 Validating family create request...');
  const { error, value } = familyCreateSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    console.log('❌ Family create validation errors:', error.details);
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      type: detail.type
    }));
    
    return res.status(400).json({ 
      error: 'Validation failed',
      details: errors
    });
  }
  
  console.log('✅ Family create validation passed');
  req.body = value;
  next();
};

exports.validateMemberAdd = (req, res, next) => {
  console.log('🔍 === VALIDATING MEMBER ADD REQUEST ===');
  console.log('Request body received:', JSON.stringify(req.body, null, 2));
  console.log('Request body keys:', Object.keys(req.body || {}));
  
  // First try simple validation for debugging
  const testResult = testMemberAddSchema.validate(req.body, { abortEarly: false });
  if (testResult.error) {
    console.log('❌ Simple validation failed:', testResult.error.details);
  } else {
    console.log('✅ Simple validation passed');
  }
  
  // Now do full validation
  const { error, value } = memberAddSchema.validate(req.body, { 
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: false,
    convert: true // Allow type conversion (string to date, etc.)
  });
  
  if (error) {
    console.log('❌ Full validation errors:');
    const errors = error.details.map(detail => {
      const errorInfo = {
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type,
        context: detail.context
      };
      console.log('  -', errorInfo);
      return errorInfo;
    });
    
    console.log('Total errors:', errors.length);
    
    return res.status(400).json({ 
      error: 'Validation failed',
      details: errors
    });
  }
  
  console.log('✅ Full validation passed');
  console.log('Validated/cleaned data:', value);
  
  // Process date fields
  if (value.dob) {
    try {
      value.dob = new Date(value.dob);
      console.log('Processed DOB:', value.dob);
    } catch (err) {
      console.log('Date processing error:', err);
    }
  }
  
  req.body = value;
  next();
};

exports.validateRegister = (req, res, next) => {
  console.log('🔍 Validating registration request...');
  const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    console.log('❌ Registration validation errors:', error.details);
    return res.status(400).json({ 
      error: 'Validation failed',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }
  
  console.log('✅ Registration validation passed');
  req.body = value;
  next();
};