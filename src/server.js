/**
 * Server Entry Point
 * ===================
 * 
 * WHAT: Starts the Express server
 * WHY:  Separates server startup from app configuration
 * 
 * This file:
 * 1. Imports the configured app
 * 2. Connects to database
 * 3. Starts listening on port
 * 4. Handles graceful shutdown
 * 
 * RUN: node src/server.js
 * DEV: npm run dev (with nodemon)
 */

import app from './app.js';
import config from './config/index.js';
import prisma from './config/database.js';

// ============================================================================
// START SERVER
// ============================================================================

async function startServer() {
  try {
    // Step 1: Test database connection
    console.log('🔌 Connecting to database...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Step 2: Start Express server
    const server = app.listen(config.port, config.host, () => {
      console.log('');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('  🚀 NDAssist API Server Started');
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`  Environment : ${config.env}`);
      console.log(`  Server      : http://${config.host}:${config.port}`);
      console.log(`  API Base    : http://${config.host}:${config.port}${config.apiPrefix}`);
      console.log(`  Platform API: http://${config.host}:${config.port}${config.apiPrefix}/platform`);
      console.log('═══════════════════════════════════════════════════════════');
      console.log('');
      console.log('📋 Available Endpoints:');
      console.log(`  GET  ${config.apiPrefix}/platform/health      - Health check`);
      console.log(`  POST ${config.apiPrefix}/platform/auth/login  - Login`);
      console.log(`  POST ${config.apiPrefix}/platform/auth/logout - Logout`);
      console.log(`  GET  ${config.apiPrefix}/platform/auth/me     - Get profile`);
      console.log('');
    });

    // Step 3: Graceful shutdown handling
    // When server receives shutdown signal, cleanup properly
    const gracefulShutdown = async (signal) => {
      console.log(`\n⚠️  ${signal} received. Shutting down gracefully...`);
      
      // Close server (stop accepting new requests)
      server.close(async () => {
        console.log('🔒 HTTP server closed');
        
        // Disconnect from database
        await prisma.$disconnect();
        console.log('🔌 Database disconnected');
        
        console.log('👋 Goodbye!');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error('⚠️  Forcing shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Listen for shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// ============================================================================
// HANDLE UNCAUGHT ERRORS
// ============================================================================

// Uncaught exceptions (programming errors)
process.on('uncaughtException', (error) => {
  console.error('❌ UNCAUGHT EXCEPTION:', error);
  process.exit(1);
});

// Unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ UNHANDLED REJECTION at:', promise, 'reason:', reason);
  process.exit(1);
});

// ============================================================================
// START
// ============================================================================

startServer();