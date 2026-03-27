import "dotenv/config";

function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;

  if (!value) {
    throw new Error(`Variável de ambiente ausente: ${name}`);
  }

  return value;
}

export const env = {
  PORT: Number(process.env.PORT ?? 3333),
  NODE_ENV: process.env.NODE_ENV ?? "development",
  FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:5173",

  FIREBASE_PROJECT_ID: requireEnv("FIREBASE_PROJECT_ID"),

  SUPABASE_URL: process.env.SUPABASE_URL ?? "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",

  WORKSPACE_JWT_SECRET: requireEnv("WORKSPACE_JWT_SECRET", "dev-secret"),
  ACCESS_CODE_FALLBACK: requireEnv("ACCESS_CODE_FALLBACK", "FLOW-2026"),
};