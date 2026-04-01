export default () => ({
  app: {
    port: Number(process.env.PORT ?? 3000),
    jwtSecret: process.env.APP_JWT_SECRET,
    jwtExpiresIn: process.env.APP_JWT_EXPIRES_IN ?? '15m',
    sessionTtlMinutes: Number(process.env.APP_SESSION_TTL_MINUTES ?? 60 * 24 * 7),
    projectAccessTtlMinutes: Number(process.env.PROJECT_ACCESS_TTL_MINUTES ?? 120),
  },
  admin: {
    elevationTtlMinutes: Number(process.env.ADMIN_ELEVATION_TTL_MINUTES ?? 30),
    reauthMaxAgeSeconds: Number(process.env.ADMIN_REAUTH_MAX_AGE_SECONDS ?? 300),
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  mercadoPago: {
    baseUrl: process.env.MP_BASE_URL ?? 'https://api.mercadopago.com',
    accessToken: process.env.MP_ACCESS_TOKEN,
    notificationUrl: process.env.MP_NOTIFICATION_URL,
    webhookSecret: process.env.MP_WEBHOOK_SECRET,
  },
  cloudflare: {
    accountId: process.env.CF_ACCOUNT_ID,
    r2AccessKeyId: process.env.CF_R2_ACCESS_KEY_ID,
    r2SecretAccessKey: process.env.CF_R2_SECRET_ACCESS_KEY,
    bucket: process.env.CF_R2_BUCKET,
    publicBaseUrl: process.env.CF_R2_PUBLIC_BASE_URL,
    defaultEnvironments: process.env.PROJECT_DEFAULT_ENVIRONMENTS ?? 'dev,hml,prod',
  },
});
