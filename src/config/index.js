/**
 * Configuration Index
 * ===================
 * Central configuration with environment validation
 */

import dotenv from 'dotenv';

// Load .env file
dotenv.config();

const config = {
  // ══════ ENVIRONMENT ══════
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',

  // ══════ SERVER ══════
  port: parseInt(process.env.PORT, 10) || 3000,
  host: process.env.HOST || '0.0.0.0',
  apiPrefix: process.env.API_PREFIX || '/api/v1',

  // ══════ DATABASE ══════
  databaseUrl: process.env.DATABASE_URL,

  // ══════ JWT ══════
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
    accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
    issuer: process.env.JWT_ISSUER || 'ndassist',
  },

  // ══════ PLATFORM JWT (Separate for platform admins) ══════
  platformJwt: {
    secret: process.env.PLATFORM_JWT_SECRET || process.env.JWT_SECRET || 'platform-super-secret-key',
    accessTokenExpiry: process.env.PLATFORM_JWT_ACCESS_EXPIRY || '1h',
    refreshTokenExpiry: process.env.PLATFORM_JWT_REFRESH_EXPIRY || '24h',
    issuer: process.env.JWT_ISSUER || 'ndassist-platform',
  },

  // ══════ BCRYPT ══════
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,
  },

  // ══════ CORS ══════
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },

  // ══════ RATE LIMITING ══════
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },

  // ══════ LOGGING ══════
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

/**
 * Validate required environment variables
 */
function validateConfig() {
  const required = ['DATABASE_URL'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach((key) => console.error(`   - ${key}`));
    
    if (config.isProduction) {
      process.exit(1);
    } else {
      console.warn('⚠️  Running in development mode with missing variables');
    }
  }

  // Warn about insecure defaults in production
  if (config.isProduction) {
    if (config.jwt.secret === 'your-super-secret-key-change-in-production') {
      console.error('❌ JWT_SECRET must be set in production');
      process.exit(1);
    }
  }
}

// Validate on load
validateConfig();

export default config;