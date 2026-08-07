import "dotenv/config";

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4001),
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProd: process.env.NODE_ENV === "production",

  databaseUrl: required("DATABASE_URL"),

  jwtAccessSecret: required("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET"),
  jwtAccessTtl: process.env.JWT_ACCESS_TTL ?? "15m",
  jwtRefreshTtl: process.env.JWT_REFRESH_TTL ?? "30d",

  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",

  publicUploadsBaseUrl:
    process.env.PUBLIC_UPLOADS_BASE_URL ?? "http://localhost:4001/uploads",

  revenueCatWebhookSecret: process.env.REVENUECAT_WEBHOOK_SECRET ?? "",

  corsOrigin: process.env.CORS_ORIGIN ?? "*",
};
