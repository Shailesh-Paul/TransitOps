import winston from "winston";
import "winston-daily-rotate-file";
import path from "path";
import { fileURLToPath } from 'url';

// Resolve __dirname since we are using ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.join(__dirname, "../../logs");

// ---------------------------------------------------------------------
// FORMATTERS
// ---------------------------------------------------------------------
const { combine, timestamp, printf, json, errors, colorize } = winston.format;

const enterpriseJsonFormat = combine(
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  errors({ stack: true }),
  json() // Native json formatter parses metadata objects nicely
);

const devConsoleFormat = combine(
  colorize(),
  printf(({ level, message, timestamp, stack, requestId, userId, label, ...meta }) => {
    let output = `${timestamp} [${level}]`;
    if (label) output += ` [${label}]`;
    if (requestId) output += ` [Req: ${requestId}]`;
    if (userId) output += ` [User: ${userId}]`;
    output += `: ${stack || message}`;
    
    // Stringify remaining metadata (excluding standard winston symbols)
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : "";
    if (metaStr && metaStr !== '{}') {
      output += ` \n  => ${metaStr}`;
    }
    
    return output;
  })
);

// ---------------------------------------------------------------------
// TRANSPORT BUILDERS
// ---------------------------------------------------------------------
const buildDailyRotate = (filename, level = "info") => {
  return new winston.transports.DailyRotateFile({
    filename: path.join(logDir, `${filename}-%DATE%.log`),
    datePattern: "YYYY-MM-DD",
    maxSize: "20m",
    maxFiles: "14d",
    level,
  });
};

const consoleTransport = new winston.transports.Console({
  format: devConsoleFormat,
  level: "debug",
});

// ---------------------------------------------------------------------
// BASE LOGGER FACTORY
// ---------------------------------------------------------------------
const createEnterpriseLogger = (filename, defaultMeta = {}, level = "info") => {
  const logger = winston.createLogger({
    level: process.env.NODE_ENV === "development" ? "debug" : level,
    format: enterpriseJsonFormat,
    defaultMeta,
    transports: [
      buildDailyRotate(filename, level)
    ],
    exitOnError: false,
  });

  if (process.env.NODE_ENV !== "production") {
    logger.add(consoleTransport);
  }

  return logger;
};

// ---------------------------------------------------------------------
// DOMAIN-SPECIFIC LOGGERS
// ---------------------------------------------------------------------

// 1. Application Logger (General app behavior)
export const appLogger = createEnterpriseLogger("application", { label: "APP" });

// 2. Request Logger (HTTP access logs)
export const reqLogger = createEnterpriseLogger("request", { label: "HTTP" });

// 3. Authentication Logger (Logins, RBAC, Tokens -> routed to application.log as requested)
export const authLogger = createEnterpriseLogger("application", { label: "AUTH" });

// 4. Database Logger (SQL Queries, Connections)
export const dbLogger = createEnterpriseLogger("database", { label: "DB" });

// 5. Error Logger (Centralized error catching)
export const errorLogger = createEnterpriseLogger("error", { label: "ERROR" }, "error");

// 6. Startup Logger (Boot sequences -> routed to application.log)
export const startupLogger = createEnterpriseLogger("application", { label: "STARTUP" });

// Default export for generic backward compatibility (if needed anywhere)
export default appLogger;
