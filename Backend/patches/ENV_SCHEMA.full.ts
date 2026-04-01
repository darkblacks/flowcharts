import * as Joi from 'joi';

export const envSchema = Joi.object({
  PORT: Joi.number().default(3000),

  APP_JWT_SECRET: Joi.string().min(16).required(),
  APP_JWT_EXPIRES_IN: Joi.string().default('15m'),
  APP_SESSION_TTL_MINUTES: Joi.number().default(10080),
  PROJECT_ACCESS_TTL_MINUTES: Joi.number().default(120),

  ADMIN_ELEVATION_TTL_MINUTES: Joi.number().default(30),
  ADMIN_REAUTH_MAX_AGE_SECONDS: Joi.number().default(300),

  FIREBASE_PROJECT_ID: Joi.string().required(),
  FIREBASE_CLIENT_EMAIL: Joi.string().required(),
  FIREBASE_PRIVATE_KEY: Joi.string().required(),

  SUPABASE_URL: Joi.string().uri().required(),
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().required(),

  MP_BASE_URL: Joi.string().uri().default('https://api.mercadopago.com'),
  MP_ACCESS_TOKEN: Joi.string().required(),
  MP_NOTIFICATION_URL: Joi.string().uri().allow('').optional(),
  MP_WEBHOOK_SECRET: Joi.string().allow('').optional(),

  CF_ACCOUNT_ID: Joi.string().required(),
  CF_R2_ACCESS_KEY_ID: Joi.string().required(),
  CF_R2_SECRET_ACCESS_KEY: Joi.string().required(),
  CF_R2_BUCKET: Joi.string().required(),
  CF_R2_PUBLIC_BASE_URL: Joi.string().uri().allow('').optional(),
  PROJECT_DEFAULT_ENVIRONMENTS: Joi.string().default('dev,hml,prod'),
});
