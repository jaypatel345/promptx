import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import crypto from "crypto";
import app from "../../../app.js";

let mongoServer;

const makeUserPayload = () => {
  const id = crypto.randomUUID();
  return {
    email: `test+${id}@example.com`,
    username: `user_${id.replace(/-/g, "").slice(0, 16)}`,
    password: "123456",
  };
};

const safeDropDatabase = async () => {
  if (mongoose.connection?.readyState !== 1) return;
  if (!mongoose.connection?.db) return;

  try {
    await mongoose.connection.db.dropDatabase();
  } catch {
    // Fallback: best-effort cleanup to avoid cascading failures
    const collections = await mongoose.connection.db.collections();
    await Promise.all(collections.map((c) => c.deleteMany({})));
  }
};

beforeAll(async () => {
  // Prefer explicit URI (CI/service). Fallback to in-memory server for local runs.
  if (!process.env.MONGO_URI_TEST) {
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGO_URI_TEST = mongoServer.getUri();
  }

  await mongoose.connect(process.env.MONGO_URI_TEST);
});

afterEach(async () => {
  await safeDropDatabase();
});

afterAll(async () => {
  if (mongoose.connection?.readyState) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe("Auth API - Register (Integration)", () => {
  test("should register user successfully", async () => {
    const payload = makeUserPayload();

    const res = await request(app).post("/api/v1/auth/register").send(payload);

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          user: expect.objectContaining({
            email: payload.email,
          }),
        }),
      }),
    );
  });
});

