import 'dotenv/config';
import http from 'http';
import app from './app.js';
import { connectDB } from './src/config/db.js';

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

import { startupLogger } from './src/utils/logger.js';

import { initSchedulers } from './src/config/scheduler.js';

const startServer = async () => {
  await connectDB();
  initSchedulers();
  
  server.listen(PORT, () => {
    startupLogger.info(`TransitOps Backend Server Started on port ${PORT}`);
    startupLogger.info('Railway MySQL Connected');
  });
};

startServer();
