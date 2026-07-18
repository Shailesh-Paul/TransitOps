import SchedulerService from '../core/SchedulerService.js';
import { runExpiryScanner } from '../jobs/expiryScanner.js';

export const initSchedulers = () => {
  // Configurable execution time via environment variable (fallback to midnight)
  const expiryCron = process.env.EXPIRY_SCANNER_CRON || '0 0 * * *';

  // Register Jobs
  SchedulerService.registerJob('DailyExpiryScanner', expiryCron, async () => {
    await runExpiryScanner();
  });

  // Start all registered jobs
  SchedulerService.startAll();
};
