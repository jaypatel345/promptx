// src/routes/queue.routes.js

import express from "express";

import { createBullBoard } from "@bull-board/api";

import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";

import { ExpressAdapter } from "@bull-board/express";

import  aiQueue  from "../queues/aiJob.queue.js";

const router = express.Router();

const serverAdapter = new ExpressAdapter();

serverAdapter.setBasePath("/admin/queues");

if (process.env.NODE_ENV !== "test") {
  createBullBoard({

    queues: [new BullMQAdapter(aiQueue)],

    serverAdapter,

  });
}

router.use("/admin/queues", serverAdapter.getRouter());

export default router;
