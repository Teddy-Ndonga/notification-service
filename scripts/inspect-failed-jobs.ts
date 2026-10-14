import { notificationQueue } from "../src/queues/notification.queue.js";

async function main() {
  try {
    const failedJobs = await notificationQueue.getFailed(0, 19);

    if (failedJobs.length === 0) {
      console.log("No failed notification jobs found.");
      return;
    }

    for (const job of failedJobs) {
      console.log({
        id: job.id,
        name: job.name,
        data: job.data,
        attemptsMade: job.attemptsMade,
        failedReason: job.failedReason,
      });
    }
  } catch (error) {
    console.error("Failed to inspect jobs:", error);
    process.exitCode = 1;
  } finally {
    await notificationQueue.close();
  }
}

main();
