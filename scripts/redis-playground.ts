import { redis } from "../src/redis.js";

async function main() {
  try {
    const pong = await redis.ping();
    console.log("Redis ping:", pong);

    await redis.set("project", "notification-service");

    const value = await redis.get("project");
    console.log("Redis value:", value);

    await redis.del("project");
    console.log("Test key deleted.");
  } catch (error) {
    console.error("Redis test failed:", error);
    process.exitCode = 1;
  } finally {
    await redis.quit();
  }
}

main();
