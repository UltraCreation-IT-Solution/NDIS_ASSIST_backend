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
import userRoutes from './modules/user/user.routes.js';
import staffRoutes from './modules/staff/staff.routes.js';
import teamRoutes from './modules/team/team.routes.js';
import payGroupRoutes from './modules/pay-group/payGroup.routes.js';
import publicHolidayRoutes from './modules/public-holiday/publicHoliday.routes.js';
import wageCalculatorRoutes from './modules/wage-calculator/wageCalculator.routes.js';
import clientRoutes from './modules/client/client.routes.js';
import schedulingRoutes from './modules/scheduling/scheduling.routes.js';
import billingRoutes from './modules/billing/billing.routes.js';
import incidentRoutes from './modules/incident/incident.routes.js';
import communicationRoutes from './modules/communication/communication.routes.js';
import formsRoutes from './modules/forms/forms.routes.js';
import documentsRoutes from './modules/documents/documents.routes.js';
import reportsRoutes from './modules/reports/reports.routes.js';
import systemRoutes from './modules/system/system.routes.js';
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
// User routes: /api/v1/users/*
app.use(`${config.apiPrefix}/users`, userRoutes);
app.use(`${config.apiPrefix}/staff`, staffRoutes);
app.use(`${config.apiPrefix}/teams`, teamRoutes);
app.use(`${config.apiPrefix}/pay-groups`, payGroupRoutes);
app.use(`${config.apiPrefix}/public-holidays`, publicHolidayRoutes);
app.use(`${config.apiPrefix}/wage-calculator`, wageCalculatorRoutes);
app.use(`${config.apiPrefix}/clients`, clientRoutes);
app.use(`${config.apiPrefix}/scheduling`, schedulingRoutes);     // /api/v1/scheduling/*
app.use(`${config.apiPrefix}/billing`, billingRoutes);           // /api/v1/billing/*
app.use(`${config.apiPrefix}/incidents`, incidentRoutes);        // /api/v1/incidents/*
app.use(`${config.apiPrefix}/communication`, communicationRoutes); // /api/v1/communication/*
app.use(`${config.apiPrefix}/forms`, formsRoutes);               // /api/v1/forms/*
app.use(`${config.apiPrefix}/documents`, documentsRoutes);       // /api/v1/documents/*
app.use(`${config.apiPrefix}/reports`, reportsRoutes);           // /api/v1/reports/*
app.use(`${config.apiPrefix}/system`, systemRoutes);             // /api/v1/system/*


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