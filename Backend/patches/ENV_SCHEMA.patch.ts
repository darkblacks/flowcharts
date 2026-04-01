// Adicione no seu src/config/env.schema.ts
CF_ACCOUNT_ID: Joi.string().required(),
CF_R2_ACCESS_KEY_ID: Joi.string().required(),
CF_R2_SECRET_ACCESS_KEY: Joi.string().required(),
CF_R2_BUCKET: Joi.string().required(),
CF_R2_PUBLIC_BASE_URL: Joi.string().uri().allow('').optional(),
PROJECT_DEFAULT_ENVIRONMENTS: Joi.string().default('dev,hml,prod'),
