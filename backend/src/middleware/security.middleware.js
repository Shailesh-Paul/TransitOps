import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import xss from 'xss-clean';
import hpp from 'hpp';
import compression from 'compression';

/**
 * Applies OWASP Enterprise Security Middlewares
 * @param {import('express').Application} app
 */
export const applySecurityMiddleware = (app) => {
  const isProd = process.env.NODE_ENV === "production";

  // 1. Secure HTTP Headers
  app.use(helmet({
    // Customize helmet for API (e.g., disable content security policy if not serving HTML)
    contentSecurityPolicy: isProd ? undefined : false,
    crossOriginEmbedderPolicy: isProd,
  }));

  // 2. Cross-Origin Resource Sharing
  const corsOptions = {
    origin: isProd ? (process.env.FRONTEND_URL || "https://yourproductiondomain.com") : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Correlation-Id', 'X-Request-Id'],
  };
  app.use(cors(corsOptions));

  // 3. API Rate Limiting (Environment Based)
  const limiter = rateLimit({
    max: isProd ? 100 : 1000, // Stricter in production (100 req per window)
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: {
      success: false,
      message: "Too many requests from this IP, please try again in 15 minutes!",
      errorCode: "ERR_RATE_LIMIT",
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });
  app.use('/api', limiter);

  // 4. Data Sanitization against XSS (Cross-Site Scripting)
  app.use(xss());

  // 5. Prevent HTTP Parameter Pollution
  // Cleans up query string parameters (e.g. ?sort=asc&sort=desc)
  // You can whitelist certain parameters if needed (e.g., `whitelist: ['sort', 'page']`)
  app.use(hpp({
    whitelist: [
      'sort',
      'order',
      'page',
      'limit',
      'search'
    ]
  }));

  // 6. Response Compression (GZIP)
  app.use(compression({
    // Only compress responses larger than 1KB
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    }
  }));
};
