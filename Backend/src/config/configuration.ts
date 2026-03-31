export default () => ({
  app: {
    port: Number(process.env.PORT ?? 3000),
    jwtSecret: process.env.APP_JWT_SECRET,
    jwtExpiresIn: process.env.APP_JWT_EXPIRES_IN ?? '15m',
    sessionTtlMinutes: Number(process.env.APP_SESSION_TTL_MINUTES ?? 60 * 24 * 7),
    projectAccessTtlMinutes: Number(process.env.PROJECT_ACCESS_TTL_MINUTES ?? 120),
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
});
