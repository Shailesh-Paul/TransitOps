import cron from 'node-cron';

class SchedulerService {
  constructor() {
    this.jobs = new Map();
  }

  /**
   * Register a new background job
   * @param {string} name - Unique identifier for the job
   * @param {string} cronExpression - Configurable execution time
   * @param {Function} taskFn - The async function to execute
   */
  registerJob(name, cronExpression, taskFn) {
    if (this.jobs.has(name)) {
      console.warn(`[SCHEDULER] Job '${name}' is already registered. Skipping.`);
      return;
    }

    if (!cron.validate(cronExpression)) {
      console.error(`[SCHEDULER] Invalid cron expression '${cronExpression}' for job '${name}'.`);
      return;
    }

    const task = cron.schedule(cronExpression, async () => {
      console.log(`[SCHEDULER] [${new Date().toISOString()}] Executing job: ${name}...`);
      const startTime = Date.now();
      
      try {
        await taskFn();
        const duration = Date.now() - startTime;
        console.log(`[SCHEDULER] Job '${name}' completed successfully in ${duration}ms.`);
      } catch (error) {
        console.error(`[SCHEDULER] [ERROR] Job '${name}' failed:`, error.message);
        // Additional error reporting (e.g. Sentry/Datadog) could be injected here
      }
    }, {
      scheduled: false // Do not auto-start upon registration
    });

    this.jobs.set(name, task);
    console.log(`[SCHEDULER] Registered job '${name}' with schedule '${cronExpression}'.`);
  }

  /**
   * Start all registered jobs
   */
  startAll() {
    console.log(`[SCHEDULER] Starting ${this.jobs.size} background jobs...`);
    for (const [name, task] of this.jobs.entries()) {
      task.start();
    }
  }

  /**
   * Stop all running jobs
   */
  stopAll() {
    console.log(`[SCHEDULER] Stopping all background jobs...`);
    for (const [name, task] of this.jobs.entries()) {
      task.stop();
    }
  }
}

// Singleton instance
export default new SchedulerService();
