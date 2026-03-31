import * as Joi from 'joi';

export const envSchema = Joi.object({
  PORT: Joi.number().default(3000),
  APP_JWT_SECRET: Joi.string().min(16).required(),
  APP_JWT_EXPIRES_IN: Joi.string().default('15m'),
  APP_SESSION_TTL_MINUTES: Joi.number().default(10080),
  PROJECT_ACCESS_TTL_MINUTES: Joi.number().default(120),

  FIREBASE_PROJECT_ID: Joi.string().required(),
  FIREBASE_CLIENT_EMAIL: Joi.string().required(),
  FIREBASE_PRIVATE_KEY: Joi.string().required(),

  SUPABASE_URL: Joi.string().uri().required(),
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().required(),
});
