import os from "os";
import { getDB, checkDatabaseHealth } from "../../config/db.js";
import ApiResponse from "../../core/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// Utility to ping database and measure latency
const pingDatabase = async () => {
  const start = Date.now();
  try {
    const db = getDB();
    await db.query("SELECT 1");
    const duration = Date.now() - start;
    return { status: "up", ping: `${duration}ms` };
  } catch (error) {
    return { status: "down", error: error.message };
  }
};

/**
 * Detailed Health Check
 * GET /api/v1/health
 */
export const getHealth = asyncHandler(async (req, res, next) => {
  const dbPing = await pingDatabase();
    const dbHealth = checkDatabaseHealth();
    
    // Calculate Memory Usage
    const freeMemory = os.freemem();
    const totalMemory = os.totalmem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsagePercent = ((usedMemory / totalMemory) * 100).toFixed(2);
    
    // CPU Load
    const cpuLoad = os.loadavg();
    
    const healthData = {
      serverStatus: "up",
      databaseStatus: dbPing.status === "up" ? "healthy" : "unhealthy",
      memoryUsage: {
        total: `${(totalMemory / 1024 / 1024).toFixed(2)} MB`,
        used: `${(usedMemory / 1024 / 1024).toFixed(2)} MB`,
        free: `${(freeMemory / 1024 / 1024).toFixed(2)} MB`,
        percentage: `${memoryUsagePercent}%`,
      },
      cpuUsage: {
        loadAvg: cpuLoad,
        cores: os.cpus().length,
      },
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || "development",
      applicationVersion: process.env.npm_package_version || "1.0.0",
      uptime: `${process.uptime().toFixed(2)}s`,
      timestamp: new Date().toISOString(),
      databasePingTime: dbPing.ping || "N/A",
      databasePoolStatus: dbHealth.poolStatus || null,
    };

    const statusCode = dbPing.status === "up" ? 200 : 503;
    ApiResponse.send(res, healthData, "Health status retrieved successfully", statusCode);
});

/**
 * Liveness Probe
 * GET /api/v1/health/live
 * Basic check to see if the Node.js process is responding.
 */
export const getLiveness = (req, res) => {
  res.status(200).json({ status: "up", timestamp: new Date().toISOString() });
};

/**
 * Readiness Probe
 * GET /api/v1/health/ready
 * Checks if the application is ready to receive traffic (e.g., DB is connected).
 */
export const getReadiness = async (req, res) => {
  const dbPing = await pingDatabase();
  if (dbPing.status === "up") {
    res.status(200).json({ status: "ready", timestamp: new Date().toISOString() });
  } else {
    res.status(503).json({ status: "not_ready", reason: "Database unavailable", timestamp: new Date().toISOString() });
  }
};
