// Se ainda não existir no seu src/config/configuration.ts
cloudflare: {
  bucket: process.env.CF_R2_BUCKET,
  publicBaseUrl: process.env.CF_R2_PUBLIC_BASE_URL,
},

// Se ainda não existir no seu src/config/env.schema.ts
CF_R2_BUCKET: Joi.string().required(),
CF_R2_PUBLIC_BASE_URL: Joi.string().uri().allow('').optional(),
