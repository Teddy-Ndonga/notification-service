import { Worker } from "bullmq";

const worker = new Worker(
  "notifications",
  async (job) => {
    console.log("Processing notification:", job.data);
  },
  {
    connection: {
      host: "127.0.0.1",
      port: 6379,
    },
  },
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully.`);
});

worker.on("failed", (job, error) => {
  console.error(`Job ${job?.id} failed:`, error.message);
});
