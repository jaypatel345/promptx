import request from "supertest";
import mongoose from "mongoose";
import crypto from "crypto";
import app from "../../../app.js";

const hasMongoUri = Boolean(process.env.MONGO_URI_TEST);
const maybeDescribe = hasMongoUri ? describe : describe.skip;

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
  if (!process.env.MONGO_URI_TEST) return;
  await mongoose.connect(process.env.MONGO_URI_TEST);
});

afterEach(async () => {
  await safeDropDatabase();
});

afterAll(async () => {
  if (mongoose.connection?.readyState) {
    await mongoose.disconnect();
  }
});

maybeDescribe("Auth API - Register (Integration)", () => {
  test("should register user successfully", async () => {
    const payload = makeUserPayload();

    const res = await request(app).post("/api/auth/register").send(payload);

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
