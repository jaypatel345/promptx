import { Queue } from "bullmq";
const aiJobQueue = new Queue("ai-jobs", {});
export default aiJobQueue;
