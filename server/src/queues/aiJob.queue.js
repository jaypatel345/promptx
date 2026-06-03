import { Queue } from "bullmq";
import { getBullMQConnection } from "../config/bullmq.js";

export const AI_JOB_QUEUE_NAME = "ai-jobs";

const createTestQueue = () => ({
  name: AI_JOB_QUEUE_NAME,
  async add() {
    return { id: "test-job" };
  },
  async close() {},
});

const aiJobQueue =
  process.env.NODE_ENV === "test"
    ? createTestQueue()
    : new Queue(AI_JOB_QUEUE_NAME, {
        connection: getBullMQConnection(),
      });

export default aiJobQueue;
