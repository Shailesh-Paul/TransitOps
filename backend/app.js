import express from 'express';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';

import { globalErrorHandler } from './src/middleware/error.middleware.js';
import { NotFoundError } from "./src/core/errors.js";

import authRoutes from './src/features/auth/auth.routes.js';
import usersRoutes from './src/features/users/users.routes.js';
import rbacRoutes from './src/features/rbac/rbac.routes.js';
import vehiclesRoutes from './src/features/vehicles/vehicles.routes.js';
import tripsRoutes from './src/features/trips/trips.routes.js';
// import reportsRoutes from "./src/features/reports/reports.routes.js";
import expensesRoutes from "./src/features/expenses/expenses.routes.js";
import fuelRoutes from "./src/features/fuel/fuel.routes.js";
import routeRoutes from './src/features/routes/routes.routes.js';
import departmentsRoutes from './src/features/departments/departments.routes.js';
import employeesRoutes from './src/features/employees/employees.routes.js';
import driversRoutes from './src/features/drivers/drivers.routes.js';
import attendanceRoutes from './src/features/attendance/attendance.routes.js';
import leavesRoutes from './src/features/leaves/leaves.routes.js';
import notificationsRoutes from './src/features/notifications/notifications.routes.js';
import settingsRoutes from './src/features/settings/settings.routes.js';
import dashboardRoutes from './src/features/dashboard/dashboard.routes.js';
import maintenanceRoutes from './src/features/maintenance/maintenance.routes.js';
import payrollRoutes from './src/features/payroll/payroll.routes.js';
import healthRoutes from './src/features/health/health.routes.js';
import analyticsRoutes from './src/features/analytics/analytics.routes.js';

import { applySecurityMiddleware } from './src/middleware/security.middleware.js';

const app = express();

// Request ID Injection & Correlation Middleware
app.use((req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] || req.headers['x-request-id'] || crypto.randomUUID();
  req.id = correlationId;
  res.setHeader('X-Request-Id', correlationId);
  next();
});

// Apply all OWASP enterprise security middlewares
applySecurityMiddleware(app);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Logging
import { reqLogger } from "./src/utils/logger.js";
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      requestId: req.id,
      userId: req.user ? req.user.id : null,
    };
    reqLogger.info(`HTTP ${req.method} ${req.originalUrl} - ${res.statusCode} [${duration}ms]`, logData);
  });
  next();
});
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: "TransitOps Backend Running"
  });
});
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/rbac', rbacRoutes);
app.use('/api/v1/vehicles', vehiclesRoutes);
app.use('/api/v1/trips', tripsRoutes);
app.use("/api/v1/maintenance", maintenanceRoutes);
app.use("/api/v1/expenses", expensesRoutes);
app.use("/api/v1/fuel", fuelRoutes);
// app.use("/api/v1/reports", reportsRoutes);
app.use('/api/v1/routes', routeRoutes);
app.use('/api/v1/departments', departmentsRoutes);
app.use('/api/v1/employees', employeesRoutes);
app.use('/api/v1/drivers', driversRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/leaves', leavesRoutes);
app.use('/api/v1/notifications', notificationsRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/payroll', payrollRoutes);
app.use('/api/v1', healthRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// Setup Swagger Documentation
import { setupSwagger } from './src/config/swagger.js';
setupSwagger(app);

app.use((req, res, next) => {
  next(new NotFoundError(`Can't find ${req.originalUrl} on this server!`));
});

app.use(globalErrorHandler);

export default app;
