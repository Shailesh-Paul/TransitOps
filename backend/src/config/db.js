/**
 * Database Configuration Module
 * 
 * Responsibilities:
 * - Establishes a production-ready MySQL connection pool.
 * - Supports connections via DATABASE_URL or individual DB_* environment variables.
 * - Implements automatic connection retries and graceful shutdown.
 * - Exposes connection pool and health check utilities.
 *
 * Supported Connection Methods:
 * 1. DATABASE_URL=mysql://user:pass@host:port/dbname
 * 2. DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
 *
 * Exported Functions:
 * - connectDB(): Initializes and tests the database connection with retries.
 * - getDB(): Retrieves the active connection pool.
 * - checkDatabaseHealth(): Returns the current health status of the pool.
 * - pool: The raw MySQL connection pool instance.
 */

import mysql from 'mysql2/promise';
import { dbLogger } from '../utils/logger.js';

let pool;

// --- Helper: Config Validation & Creation ---
const createPoolConfig = () => {
  const DATABASE_URL = process.env.DATABASE_URL || process.env.MYSQL_URL;
  const DB_HOST = process.env.DB_HOST || process.env.MYSQLHOST;
  const DB_PORT = process.env.DB_PORT || process.env.MYSQLPORT;
  const DB_USER = process.env.DB_USER || process.env.MYSQLUSER;
  const DB_PASSWORD = process.env.DB_PASSWORD || process.env.MYSQLPASSWORD;
  const DB_NAME = process.env.DB_NAME || process.env.MYSQLDATABASE;
  const DB_SSL = process.env.DB_SSL;

  const sslConfig = DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined;
  
  // Production-ready connection pool best practices
  const poolDefaults = {
    waitForConnections: true,
    connectionLimit: process.env.DB_CONNECTION_LIMIT ? parseInt(process.env.DB_CONNECTION_LIMIT, 10) : 50,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
  };

  if (DATABASE_URL) {
    return {
      uri: DATABASE_URL,
      ...poolDefaults,
      ...(sslConfig && { ssl: sslConfig })
    };
  }

  // Validate required environment variables if DATABASE_URL is not provided
  const missing = [];
  if (!DB_HOST) missing.push('DB_HOST');
  if (!DB_USER) missing.push('DB_USER');
  if (!DB_PASSWORD) missing.push('DB_PASSWORD');
  if (!DB_NAME) missing.push('DB_NAME');
  
  if (missing.length > 0) {
    console.error(`❌ Missing required database environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  return {
    host: DB_HOST,
    port: DB_PORT ? Number(DB_PORT) : 3306,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    ...poolDefaults,
    ...(sslConfig && { ssl: sslConfig })
  };
};

// --- Helper: Error Formatting ---
const formatDBError = (err) => {
  const commonErrors = {
    'ER_ACCESS_DENIED_ERROR': 'Invalid database credentials (username or password).',
    'ECONNREFUSED': 'Database server refused the connection. Ensure it is running.',
    'ENOTFOUND': 'Database host could not be resolved.',
    'ETIMEDOUT': 'Connection to database timed out.',
    'PROTOCOL_CONNECTION_LOST': 'Database connection was lost.'
  };

  return {
    message: commonErrors[err.code] || 'An unexpected database error occurred.',
    code: err.code || 'UNKNOWN',
    errno: err.errno || 'UNKNOWN',
    sqlState: err.sqlState || 'UNKNOWN',
    sqlMessage: err.sqlMessage || err.message,
    stack: err.stack
  };
};

// --- Initialize Pool ---
export const connectDB = async () => {
  const config = createPoolConfig();
  const isUrlBased = !!(process.env.DATABASE_URL || process.env.MYSQL_URL);
  
  pool = mysql.createPool(config);

  const MAX_RETRIES = 5;
  const RETRY_DELAY_MS = 5000;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    let connection;
    try {
      connection = await pool.getConnection();
      
      // Connection Testing
      await connection.query('SELECT 1');
      const [rows] = await connection.query('SELECT DATABASE() AS dbName');
      const activeDb = rows[0]?.dbName || process.env.DB_NAME || 'Unknown';
      
      // Extract connection info for logging safely (no credentials logged)
      let host = 'Unknown';
      let port = 3306;
      if (isUrlBased) {
        try {
          const parsedUrl = new URL(process.env.DATABASE_URL || process.env.MYSQL_URL);
          host = parsedUrl.hostname;
          port = parsedUrl.port || 3306;
        } catch (e) {
          host = 'Invalid URL Format';
        }
      } else {
        host = process.env.DB_HOST || process.env.MYSQLHOST;
        port = process.env.DB_PORT || process.env.MYSQLPORT || 3306;
      }
      
      dbLogger.info(`MySQL Connected Successfully`, {
        database: activeDb,
        host,
        port,
        ssl: process.env.DB_SSL === 'true' ? 'Enabled' : 'Disabled',
        connectionType: isUrlBased ? 'DATABASE_URL' : 'Environment Variables'
      });

      return pool;
    } catch (error) {
      const formattedErr = formatDBError(error);
      dbLogger.error(`Database Connection Attempt ${attempt}/${MAX_RETRIES} Failed`, {
        description: formattedErr.message,
        code: formattedErr.code,
        errno: formattedErr.errno,
        sqlState: formattedErr.sqlState,
        sqlMessage: formattedErr.sqlMessage,
        stackTrace: formattedErr.stack
      });

      if (attempt === MAX_RETRIES) {
        dbLogger.error('Maximum connection retries reached. Exiting application.');
        process.exit(1);
      }
      
      dbLogger.info(`Retrying in ${RETRY_DELAY_MS / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
    } finally {
      // Ensure the connection is released even if an error occurs
      if (connection) {
        connection.release();
      }
    }
  }
};

// --- Export Active Pool ---
export const getDB = () => {
  if (!pool) {
    throw new Error('Database is not initialized. Call connectDB() before using the database.');
  }
  return pool;
};

// --- Health Check Utility ---
export const checkDatabaseHealth = () => {
  if (!pool) {
    return { connected: false, message: 'Database not initialized.' };
  }
  
  // Provide raw insight into the mysql2 connection pool arrays
  const underlyingPool = pool.pool || pool;
  const poolStatus = {
    totalConnections: underlyingPool._allConnections?.length || 0,
    freeConnections: underlyingPool._freeConnections?.length || 0,
    waitingQueries: underlyingPool._connectionQueue?.length || 0
  };

  return {
    connected: true,
    database: process.env.DB_NAME || 'Unknown',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    poolStatus
  };
};

export { pool };

// --- Graceful Shutdown ---
const shutdownHandler = async (signal) => {
  dbLogger.info(`Received ${signal}. Closing MySQL connection pool...`);
  if (pool) {
    try {
      await pool.end();
      dbLogger.info('MySQL pool closed successfully.');
    } catch (err) {
      dbLogger.error('Error closing MySQL pool', { message: err.message });
    }
  }
  process.exit(0);
};

// Handle process termination events for graceful shutdown
process.on('SIGINT', () => shutdownHandler('SIGINT'));
process.on('SIGTERM', () => shutdownHandler('SIGTERM'));

export default connectDB;