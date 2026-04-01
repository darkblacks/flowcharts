// Adicione no seu src/config/configuration.ts
cloudflare: {
  accountId: process.env.CF_ACCOUNT_ID,
  r2AccessKeyId: process.env.CF_R2_ACCESS_KEY_ID,
  r2SecretAccessKey: process.env.CF_R2_SECRET_ACCESS_KEY,
  bucket: process.env.CF_R2_BUCKET,
  publicBaseUrl: process.env.CF_R2_PUBLIC_BASE_URL,
  defaultEnvironments: process.env.PROJECT_DEFAULT_ENVIRONMENTS ?? 'dev,hml,prod',
},
