import request from "supertest";
import app from "../../../app.js";
import mongoose from "mongoose";
import crypto from "crypto";

const hasMongoUri = Boolean(process.env.MONGO_URI_TEST);
const maybeDescribe = hasMongoUri ? describe : describe.skip;

maybeDescribe("Auth API - Register", () => {
  const makeUserPayload = () => {
    const id = crypto.randomUUID();
    return {
      email: `test+${id}@example.com`,
      username: `user_${id.replace(/-/g, "").slice(0, 16)}`,
      password: "123456",
    };
  };

  // Connect to test DB
  beforeAll(async () => {
    if (!process.env.MONGO_URI_TEST) return;
    await mongoose.connect(process.env.MONGO_URI_TEST);
  });
  // Clean DB after each test
  afterEach(async () => {
    if (mongoose.connection?.readyState === 1 && mongoose.connection?.db) {
      try {
        await mongoose.connection.db.dropDatabase();
      } catch {
        const collections = await mongoose.connection.db.collections();
        await Promise.all(collections.map((c) => c.deleteMany({})));
      }
    }
  });
  // Close DB connection
  afterAll(async () => {
    if (mongoose.connection?.readyState) {
      await mongoose.disconnect();
    }
  });

  test("should register user successfully", async () => {
    const payload = makeUserPayload();
    const res = await request(app).post("/api/v1/auth/register").send(payload);

    //  Status check
    expect(res.statusCode).toBe(201);

    //  Response structure
    expect(res.body).toHaveProperty("success", true);

    expect(res.body.data).toHaveProperty("user");

    expect(res.body.data.user).toHaveProperty("email", payload.email);
  });
  test("should fail if user allready exists", async () => {
    const payload = makeUserPayload();
    await request(app).post("/api/v1/auth/register").send(payload);
    const res = await request(app).post("/api/v1/auth/register").send(payload);
    // service throws 400 for already exists
    expect(res.statusCode).toBe(400);
  });
  test("should not return password in response", async () => {
    const payload = makeUserPayload();
    const res = await request(app).post("/api/v1/auth/register").send(payload);
    expect(res.body.data.user.password).toBeUndefined();
  });
  test("should fail on wrong password", async () => {
    const payload = makeUserPayload();
    await request(app).post("/api/v1/auth/register").send(payload);

    const res = await request(app).post("/api/v1/auth/login").send({
      email: payload.email,
      password: "wrong",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message", "Invalid email or password");
  });
});
