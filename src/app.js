/**
 * Express Application
 * ===================
 * 
 * WHAT: Main Express app configuration
 * 
 * FLOW:
 * Request → Security Middleware → Body Parser → Routes → Error Handler → Response
 * 
 * NOTE: Express 5 handles async errors automatically - no wrapper needed!
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import config from './config/index.js';

// Routes
import platformRoutes from './modules/platform/platform.routes.js';
import organizationRoutes from './modules/organization/organization.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
// Error handlers
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';

// Create Express app
const app = express();

// ... rest of the file stays the same

// ══════════════════════════════════════════════════════════════
// SECURITY MIDDLEWARE
// ══════════════════════════════════════════════════════════════

// Helmet - Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Cookie parser
app.use(cookieParser());

// ══════════════════════════════════════════════════════════════
// BODY PARSING
// ══════════════════════════════════════════════════════════════

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ══════════════════════════════════════════════════════════════
// REQUEST LOGGING (Development)
// ══════════════════════════════════════════════════════════════

if (config.isDevelopment) {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    });
    next();
  });
}

// ══════════════════════════════════════════════════════════════
// ROOT HEALTH CHECK
// ══════════════════════════════════════════════════════════════

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'NDAssist API is running',
    timestamp: new Date().toISOString(),
    environment: config.env,
  });
});

// ══════════════════════════════════════════════════════════════
// API ROUTES
// ══════════════════════════════════════════════════════════════

// Platform Admin routes: /api/v1/platform/*
app.use(`${config.apiPrefix}/platform`, platformRoutes);
app.use(`${config.apiPrefix}/platform/organizations`, organizationRoutes);
// Auth routes: /api/v1/auth/*
app.use(`${config.apiPrefix}/auth`, authRoutes);
// Future routes:
// app.use(`${config.apiPrefix}/auth`, authRoutes);
// app.use(`${config.apiPrefix}/organizations`, organizationRoutes);
// app.use(`${config.apiPrefix}/users`, userRoutes);
// app.use(`${config.apiPrefix}/staff`, staffRoutes);
// app.use(`${config.apiPrefix}/clients`, clientRoutes);
// app.use(`${config.apiPrefix}/scheduling`, schedulingRoutes);
// app.use(`${config.apiPrefix}/billing`, billingRoutes);
// app.use(`${config.apiPrefix}/incidents`, incidentRoutes);
// app.use(`${config.apiPrefix}/reports`, reportRoutes);

// ══════════════════════════════════════════════════════════════
// ERROR HANDLING (Must be LAST)
// ══════════════════════════════════════════════════════════════

// 404 - Route not found
app.use(notFoundHandler);

// Global error handler - catches ALL errors
app.use(errorHandler);

// ══════════════════════════════════════════════════════════════
// EXPORT
// ══════════════════════════════════════════════════════════════

export default app;