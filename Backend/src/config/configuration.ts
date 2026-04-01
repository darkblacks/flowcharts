export default () => ({
  app: {
    port: Number(process.env.PORT ?? 3000),
    jwtSecret: process.env.APP_JWT_SECRET,
    jwtExpiresIn: process.env.APP_JWT_EXPIRES_IN ?? '15m',
    sessionTtlMinutes: Number(process.env.APP_SESSION_TTL_MINUTES ?? 60 * 24 * 7),
    projectAccessTtlMinutes: Number(process.env.PROJECT_ACCESS_TTL_MINUTES ?? 120),
    frontendUrl: process.env.FRONTEND_URL,
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
    webhookSecret: process.env.MP_WEBHOOK_SECRET,
    notificationUrl: process.env.MP_NOTIFICATION_URL,
  },
  cloudflare: {
    bucket: process.env.CF_R2_BUCKET,
    publicBaseUrl: process.env.CF_R2_PUBLIC_BASE_URL,
  },
});
